<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:null-product-thumbnails')]
#[Description('Set all product thumbnails to null')]
class NullProductThumbnails extends Command
{
    public function handle(): int
    {
        $count = Product::whereNotNull('thumbnail')->update(['thumbnail' => null]);

        $this->info("Nulled {$count} thumbnails.");

        return self::SUCCESS;
    }
}
