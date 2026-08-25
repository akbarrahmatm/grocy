<?php

use App\Models\Address;
use App\Models\Category;
use App\Models\Product;
use App\Models\Uom;
use App\Models\User;
use App\Services\ProductService;

function customerWithProduct(int $stock): array
{
    $user = User::factory()->create(['is_customer' => true]);
    $category = Category::create(['name' => 'Groceries', 'slug' => 'groceries', 'is_active' => true]);
    $uom = Uom::create(['name' => 'Pieces', 'code' => 'pcs', 'is_active' => true]);
    $product = Product::create([
        'category_id' => $category->id,
        'uom_id' => $uom->id,
        'name' => 'Kopi Sachet',
        'slug' => 'kopi-sachet-'.uniqid(),
        'sku' => 'SKU-'.uniqid(),
        'price' => 2000,
        'stock' => $stock,
        'is_active' => true,
    ]);

    return [$user, $product];
}

it('rejects adding to cart beyond available stock', function () {
    [$user, $product] = customerWithProduct(3);

    $this->actingAs($user)
        ->postJson('/api/cart', ['product_id' => $product->id, 'qty' => 5])
        ->assertStatus(422)
        ->assertJsonFragment(['message' => 'Only 3 in stock for Kopi Sachet.']);
});

it('counts existing cart qty when validating stock on add', function () {
    [$user, $product] = customerWithProduct(3);

    $this->actingAs($user)
        ->postJson('/api/cart', ['product_id' => $product->id, 'qty' => 2])
        ->assertCreated();

    $this->actingAs($user)
        ->postJson('/api/cart', ['product_id' => $product->id, 'qty' => 2])
        ->assertStatus(422);
});

it('rejects cart qty update beyond available stock', function () {
    [$user, $product] = customerWithProduct(3);

    $item = $this->actingAs($user)
        ->postJson('/api/cart', ['product_id' => $product->id, 'qty' => 1])
        ->assertCreated()
        ->json();

    $this->actingAs($user)
        ->putJson("/api/cart/{$item['id']}", ['qty' => 4])
        ->assertStatus(422);
});

it('rejects checkout when requested qty exceeds stock', function () {
    [$user, $product] = customerWithProduct(1);

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

    $res = $this->actingAs($user)
        ->postJson('/api/order', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'qty' => 5]],
        ])
        ->assertStatus(422);

    expect($res->json('message'))->toContain('Insufficient stock')
        ->and($product->fresh()->stock)->toBe(1);
});

it('lists in-stock products before out-of-stock ones', function () {
    [, $inStock] = customerWithProduct(5);
    $out = Product::create([
        'category_id' => $inStock->category_id,
        'uom_id' => $inStock->uom_id,
        'name' => 'Habis Dulu',
        'slug' => 'habis-dulu-'.uniqid(),
        'sku' => 'SKU-OUT-'.uniqid(),
        'price' => 1000,
        'stock' => 0,
        'is_active' => true,
    ]);

    $names = app(ProductService::class)->list()
        ->getCollection()
        ->pluck('name');

    expect($names->search($inStock->name))->toBeLessThan($names->search($out->name));
});
