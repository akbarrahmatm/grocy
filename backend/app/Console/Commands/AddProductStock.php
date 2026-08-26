<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\StockService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-product-stock')]
#[Description('Create an "in" stock adjustment of 50 for every product')]
class AddProductStock extends Command
{
    public function handle(StockService $stock): int
    {
        $count = 0;

        Product::query()->orderBy('id')->each(function (Product $product) use ($stock, &$count): void {
            $stock->adjust([
                'product_id' => $product->id,
                'type' => 'in',
                'qty' => 50,
                'note' => 'Auto top-up +50',
            ]);
            $count++;
        });

        $this->info("Created {$count} stock adjustments (+50 each).");

        return self::SUCCESS;
    }
}
