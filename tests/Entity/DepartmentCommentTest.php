<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Entity;

use App\Entity\CommentTableTypeTrait;
use App\Entity\Department;
use App\Entity\DepartmentComment;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(CommentTableTypeTrait::class)]
#[CoversClass(DepartmentComment::class)]
class DepartmentCommentTest extends AbstractCommentEntityTestCase
{
    protected function getEntity(): DepartmentComment
    {
        return new DepartmentComment(new Department('foo'));
    }
}
