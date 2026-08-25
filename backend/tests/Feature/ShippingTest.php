<?php

use App\Models\Address;
use App\Models\Integration;
use App\Models\Order;
use App\Models\User;
use App\Services\ShippingService;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;

function komshipGateway(array $config = []): Integration
{
    return Integration::create([
        'provider' => 'komship',
        'environment' => 'sandbox',
        'is_active' => true,
        'config' => array_merge([
            'api_key' => Crypt::encryptString('test-key'),
            'origin_destination_id' => 17588,
            'origin_address' => 'Gudang Grocy',
            'brand_name' => 'Grocy',
            'shipper_name' => 'Grocy Store',
            'shipper_phone' => '081234567890',
            'origin_latitude' => '-6.291974',
            'origin_longitude' => '106.801207',
        ], $config),
    ]);
}

it('normalizes komship destination search results', function () {
    komshipGateway();

    Http::fake([
        '*tariff/api/v1/destination/search*' => Http::response([
            'message' => 'success',
            'data' => [
                ['destination_id' => 68423, 'suburb' => 'Kiaracondong', 'district' => null, 'city' => 'Bandung', 'province' => 'Jawa Barat', 'zip_code' => '40282'],
                ['destination_id' => 68423, 'city' => 'Bandung'],
                ['destination_id' => null],
            ],
        ]),
    ]);

    $data = app(ShippingService::class)->destinations('kiaracondong');

    expect($data)->toHaveCount(1)
        ->and($data[0]['id'])->toBe(68423)
        ->and($data[0]['label'])->toBe('Kiaracondong, Bandung, Jawa Barat, 40282');
});

it('returns no destinations for a short keyword without calling the api', function () {
    komshipGateway();

    Http::fake();

    $data = app(ShippingService::class)->destinations('ab');

    expect($data)->toBeArray()->toBeEmpty();
    Http::assertNothingSent();
});

it('calculates and normalizes tariffs for an address', function () {
    komshipGateway();

    $user = User::factory()->create();
    $address = Address::create([
        'user_id' => $user->id,
        'label' => 'Home',
        'receiver_name' => 'Buyer',
        'phone' => '0812',
        'address' => 'Jl. Test',
        'city' => 'Bandung',
        'province' => 'Jawa Barat',
        'postal_code' => '40282',
        'destination_id' => 68424,
        'latitude' => '-6.288941',
        'longitude' => '106.806473',
        'is_default' => false,
    ]);

    Http::fake([
        '*tariff/api/v1/calculate*' => Http::response([
            'data' => [
                'cod' => true,
                'tariffs' => [
                    ['shipping_name' => 'J&T', 'code' => 'JNT', 'service' => 'EZ', 'description' => 'Economy Express', 'shipping_cost' => 14800, 'etd' => '2-3'],
                    ['shipping_cost' => 1000], // malformed, dropped
                ],
            ],
        ]),
    ]);

    $rates = app(ShippingService::class)->rates($address, [['product_id' => 1, 'qty' => 2]]);

    expect($rates)->toHaveCount(1)
        ->and($rates[0])->toMatchArray([
            'company' => 'J&T',
            'code' => 'JNT',
            'service' => 'EZ',
            'price' => 14800,
        ]);

    Http::assertSent(function ($request) {
        return str_contains($request->url(), '/tariff/api/v1/calculate')
            && $request['weight'] === 2
            && $request['receiver_destination_id'] === 68424
            && $request['cod'] === 'no'
            && $request['destination_pin_point'] === '-6.288941,106.806473';
    });
});

it('refuses to calculate when the address has no destination area', function () {
    komshipGateway();

    $user = User::factory()->create();
    $address = Address::create([
        'user_id' => $user->id,
        'label' => 'Home',
        'receiver_name' => 'Buyer',
        'phone' => '0812',
        'address' => 'Jl. Test',
        'city' => 'Bandung',
        'province' => 'Jawa Barat',
        'postal_code' => '40282',
        'is_default' => false,
    ]);

    app(ShippingService::class)->rates($address, [['product_id' => 1, 'qty' => 1]]);
})->throws(LogicException::class);

it('registers the shipment and persists order references', function () {
    komshipGateway();

    $user = User::factory()->create();
    $order = Order::create([
        'user_id' => $user->id,
        'order_number' => 'ORD-TEST-001',
        'status' => 'pending',
        'shipping_name' => 'Buyer Bandung',
        'shipping_phone' => '08123458282',
        'shipping_address' => 'Alamat penerima',
        'shipping_city' => 'Bandung',
        'shipping_postal_code' => '40282',
        'destination_id' => 68424,
        'courier_company' => 'J&T',
        'courier_code' => 'JNT',
        'courier_service' => 'EZ',
        'subtotal' => 10000,
        'shipping_cost' => 14800,
        'total' => 24800,
        'note' => 'Contoh note',
    ]);

    Http::fake([
        '*order/api/v1/orders/store*' => Http::response([
            'message' => 'success',
            'data' => ['order_no' => 'KOM42272202508140857', 'airway_bill' => 'KOMERKOM000111'],
        ]),
    ]);

    app(ShippingService::class)->storeOrder($order->setRelation('items', collect()));

    expect($order->refresh()->komship_order_no)->toBe('KOM42272202508140857')
        ->and($order->airway_bill)->toBe('KOMERKOM000111');

    Http::assertSent(function ($request) {
        return $request['shipping'] === 'JNT'
            && $request['shipping_type'] === 'EZ'
            && $request['payment_method'] === 'BANK TRANSFER'
            && $request['grand_total'] === 24800
            && $request['receiver_destination_id'] === 68424;
    });
});
