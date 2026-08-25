<?php

namespace Database\Seeders;

use App\Models\Uom;
use Illuminate\Database\Seeder;

class UomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $uoms = [
            ['name' => 'Kilogram', 'code' => 'kg'],
            ['name' => 'Gram', 'code' => 'g'],
            ['name' => 'Liter', 'code' => 'L'],
            ['name' => 'Milliliter', 'code' => 'ml'],
            ['name' => 'Piece', 'code' => 'pcs'],
            ['name' => 'Box', 'code' => 'box'],
        ];

        foreach ($uoms as $uom) {
            Uom::updateOrCreate(['code' => $uom['code']], $uom);
        }
    }
}
