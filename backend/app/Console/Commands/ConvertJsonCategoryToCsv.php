<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:convert-json-category-to-csv')]
#[Description('Convert categories.json to categories.csv')]
class ConvertJsonCategoryToCsv extends Command
{
    public function handle(): int
    {
        return $this->convert(
            resource_path('csv/categories.json'),
            resource_path('csv/categories.csv')
        );
    }

    protected function convert(string $jsonPath, string $csvPath): int
    {
        if (! is_file($jsonPath)) {
            $this->error("File not found: {$jsonPath}");

            return self::FAILURE;
        }

        $rows = json_decode(file_get_contents($jsonPath), true);

        if (! is_array($rows) || $rows === []) {
            $this->error('Invalid or empty JSON.');

            return self::FAILURE;
        }

        $out = fopen($csvPath, 'w');

        fputcsv($out, array_keys($rows[0]));

        foreach ($rows as $row) {
            fputcsv($out, $row);
        }

        fclose($out);

        $this->info("Converted to {$csvPath} (".count($rows).' rows).');

        return self::SUCCESS;
    }
}
