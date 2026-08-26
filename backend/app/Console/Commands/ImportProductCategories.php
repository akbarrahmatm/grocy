<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use App\Models\Uom;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('app:import-product-categories')]
#[Description('Import categories then products from CSV files')]
class ImportProductCategories extends Command
{
    public function handle(): int
    {
        $categoryCount = $this->importCategories();
        $productCount = $this->importProducts();

        $this->info("Imported {$categoryCount} categories, {$productCount} products.");

        return self::SUCCESS;
    }

    protected function importCategories(): int
    {
        $rows = $this->readCsv(resource_path('csv/categories.csv'));

        return DB::transaction(function () use ($rows) {
            $count = 0;

            foreach ($rows as $row) {
                Category::updateOrCreate(
                    ['id' => $row['id']],
                    [
                        'name' => $row['name'],
                        'slug' => $row['slug'],
                        'description' => $row['description'],
                        'is_active' => filter_var($row['is_active'], FILTER_VALIDATE_BOOLEAN),
                    ]
                );
                $count++;
            }

            return $count;
        });
    }

    protected function importProducts(): int
    {
        $rows = $this->readCsv(resource_path('csv/products.csv'));
        $uomIds = Uom::pluck('id')->flip();
        $count = 0;

        foreach ($rows as $row) {
            $categoryId = (int) $row['category_id'];

            if (! Category::whereKey($categoryId)->exists()) {
                $this->warn("Skipping {$row['slug']}: category {$categoryId} not found.");

                continue;
            }

            $uomId = (int) $row['uom_id'];

            if (! $uomIds->has($uomId)) {
                $this->warn("Skipping {$row['slug']}: uom {$uomId} not found.");

                continue;
            }

            Product::updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'category_id' => $categoryId,
                    'uom_id' => $uomId,
                    'name' => $row['name'],
                    // ponytail: CSV has no sku; use slug until real SKU source exists
                    'sku' => $row['slug'],
                    'description' => $row['description'],
                    'thumbnail' => $row['thumbnail'],
                    'price' => $row['price'],
                    'is_active' => filter_var($row['is_active'], FILTER_VALIDATE_BOOLEAN),
                ]
            );
            $count++;
        }

        return $count;
    }

    protected function readCsv(string $path): array
    {
        if (! is_file($path)) {
            $this->error("File not found: {$path}");
            exit(self::FAILURE);
        }

        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);
        $rows = [];

        while (($data = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($header, $data);
        }

        fclose($handle);

        return $rows;
    }
}
