<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Uom;

class UpdateProductUom extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:product-uom';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update product UOM IDs based on CSV file (matches UOM code)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $csvPath = base_path('resources/csv/products.csv');

        if (!file_exists($csvPath)) {
            $this->error("CSV file not found: {$csvPath}");
            return 1;
        }

        if (($handle = fopen($csvPath, 'r')) === false) {
            $this->error("Could not open CSV file: {$csvPath}");
            return 1;
        }

        $header = fgetcsv($handle);
        if ($header === false) {
            $this->error("CSV file is empty or invalid.");
            fclose($handle);
            return 1;
        }

        // Find index of slug and uom_code columns
        $slugIndex = array_search('slug', $header);
        $uomCodeIndex = array_search('uom_code', $header);

        if ($slugIndex === false || $uomCodeIndex === false) {
            $this->error("Required columns 'slug' or 'uom_code' not found in CSV header.");
            fclose($handle);
            return 1;
        }

        $updatedCount = 0;
        $notFoundCount = 0;
        $invalidUomCount = 0;

        while (($row = fgetcsv($handle)) !== false) {
            // Skip rows that don't have enough columns
            if (count($row) <= max($slugIndex, $uomCodeIndex)) {
                continue;
            }

            $slug = $row[$slugIndex];
            $uomCode = $row[$uomCodeIndex];

            // Find UOM by code
            $uom = Uom::where('code', $uomCode)->first();

            if (!$uom) {
                $invalidUomCount++;
                Log::warning("UOM not found for code: {$uomCode} (product slug: {$slug})");
                continue;
            }

            // Check product exists by slug first
            $product = DB::table('products')->where('slug', $slug)->first();

            if (!$product) {
                $notFoundCount++;
                Log::warning("Product not found for slug: {$slug}");
                continue;
            }

            // Update product by slug
            DB::table('products')
                ->where('slug', $slug)
                ->update(['uom_id' => $uom->id]);

            $updatedCount++;
        }

        fclose($handle);

        $this->info("Updated {$updatedCount} product UOM IDs.");
        if ($notFoundCount > 0) {
            $this->warn("{$notFoundCount} products not found in database (check slugs).");
        }
        if ($invalidUomCount > 0) {
            $this->warn("{$invalidUomCount} UOM codes in CSV not found in uoms table.");
        }

        return 0;
    }
}
