<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // برای جلوگیری از ایجاد رکوردهای تکراری، جدول را پاک می‌کنیم
        // (این خط را در پروداکشن کامنت کنید)
        DB::table('organizations')->delete();

        // --- سطح ۱: سازمان ریشه ---
        $root = Organization::factory()->create([
            'name' => 'شرکت مادر (هلدینگ)',
            'parent_id' => null,
        ]);

        // --- سطح ۲: معاونت‌ها (فرزندان ریشه) ---
        $techDeputy = Organization::factory()->create([
            'name' => 'معاونت فنی و مهندسی',
            'parent_id' => $root->id,
        ]);

        $adminDeputy = Organization::factory()->create([
            'name' => 'معاونت اداری و مالی',
            'parent_id' => $root->id,
        ]);

        $salesDeputy = Organization::factory()->create([
            'name' => 'معاونت بازرگانی',
            'parent_id' => $root->id,
        ]);

        // --- سطح ۳: واحدها (فرزندان معاونت‌ها) ---

        // فرزندان معاونت فنی
        Organization::factory()->create([
            'name' => 'واحد نرم‌افزار',
            'parent_id' => $techDeputy->id,
        ]);
        Organization::factory()->create([
            'name' => 'واحد شبکه و زیرساخت',
            'parent_id' => $techDeputy->id,
        ]);

        // فرزندان معاونت اداری
        Organization::factory()->create([
            'name' => 'واحد منابع انسانی',
            'parent_id' => $adminDeputy->id,
        ]);
        Organization::factory()->create([
            'name' => 'واحد امور مالی',
            'parent_id' => $adminDeputy->id,
        ]);

        // فرزندان معاونت بازرگانی
        Organization::factory()->create([
            'name' => 'واحد فروش',
            'parent_id' => $salesDeputy->id,
        ]);
    }
}