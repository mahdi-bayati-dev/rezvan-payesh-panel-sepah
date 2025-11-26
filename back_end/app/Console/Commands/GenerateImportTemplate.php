<?php

namespace App\Console\Commands;

use App\Exports\UserImportTemplateExport;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;

class GenerateImportTemplate extends Command
{
    /**
     * نام دستور در ترمینال
     */
    protected $signature = 'import:template';

    /**
     * توضیحات دستور
     */
    protected $description = 'Generate a sample Excel template for user bulk import';

    public function handle()
    {
        $this->info('Generating user import template...');

        $fileName = 'user_import_sample.xlsx';

        try
        {
            Excel::store(new UserImportTemplateExport, $fileName, 'public');

            $this->info("✅ Template successfully generated!");
            $this->line("File Path: storage/app/public/{$fileName}");
            $this->line("Download URL (Example): " . asset("storage/{$fileName}"));

        }
        catch (\Exception $e)
        {
            $this->error("❌ Error generating template: " . $e->getMessage());
        }
    }
}