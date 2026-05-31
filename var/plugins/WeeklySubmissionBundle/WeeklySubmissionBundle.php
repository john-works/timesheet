<?php

namespace KimaiPlugin\WeeklySubmissionBundle;

use App\Plugin\PluginInterface;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class WeeklySubmissionBundle extends Bundle implements PluginInterface
{
    public function getPath(): string
    {
        return \dirname(__DIR__) . '/WeeklySubmissionBundle';
    }
}
