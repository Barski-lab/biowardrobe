drop view if exists `mm10`.`trackDb_external`;
CREATE 
VIEW `mm10`.`trackDb_external` AS
    select 
        replace(concat(`l`.`uid`, '_wtrack'),
            '-',
            '_') AS `tableName`,
        `l`.`name4browser` AS `shortLabel`,
        if((`et`.`etype` like '%dUTP%'),
            'PbedGraph 4',
            'bedGraph 4') AS `type`,
        `l`.`name4browser` AS `longLabel`,
        0 AS `visibility`,
        10 AS `priority`,
        30 AS `colorR`,
        70 AS `colorG`,
        150 AS `colorB`,
        30 AS `altColorR`,
        70 AS `altColorG`,
        150 AS `altColorB`,
        0 AS `useScore`,
        0 AS `private`,
        0 AS `restrictCount`,
        '' AS `restrictList`,
        '' AS `url`,
        '' AS `html`,
        `l`.`egroup_id` AS `grp`,
        0 AS `canPack`,
        'autoScale on
        windowingFunction maximum' AS `settings`
    from
        ((`ems`.`labdata` `l`
        join `ems`.`experimenttype` `et`)
        join `ems`.`genome` `g`)
    where
        ((`l`.`deleted` = 0)
			and (`l`.`browsershare` = 1)
            and (`l`.`libstatus` between 10 and 99)
            and (`l`.`experimenttype_id` = `et`.`id`)
            and (`et`.`etype` like '%RNA%')
            and (`l`.`genome_id` = `g`.`id`)
            and (`l`.`egroup_id` is not null)
            and (`g`.`db` like 'mm%')) 
    union select 
        replace(concat(`l`.`uid`, '_grp'),
            '-',
            '_') AS `tableName`,
        `l`.`name4browser` AS `shortLabel`,
        'bed 4 +' AS `type`,
        `l`.`name4browser` AS `longLabel`,
        0 AS `visibility`,
        10 AS `priority`,
        30 AS `colorR`,
        70 AS `colorG`,
        150 AS `colorB`,
        30 AS `altColorR`,
        70 AS `altColorG`,
        150 AS `altColorB`,
        0 AS `useScore`,
        0 AS `private`,
        0 AS `restrictCount`,
        '' AS `restrictList`,
        '' AS `url`,
        '' AS `html`,
        `l`.`egroup_id` AS `grp`,
        0 AS `canPack`,
        concat('
                compositeTrack on
                group ',
                `l`.`egroup_id`,
                '
                 track ',
                replace(concat(`l`.`uid`, '_grp'),
                    '-',
                    '_'),
                '') AS `settings`
    from
        ((`ems`.`labdata` `l`
        join `ems`.`experimenttype` `et`)
        join `ems`.`genome` `g`)
    where
        ((`l`.`deleted` = 0)
			and (`l`.`browsershare` = 1)
            and (`l`.`libstatus` between 10 and 99)
            and (`l`.`experimenttype_id` = `et`.`id`)
            and (`et`.`etype` like '%DNA%')
            and (`l`.`genome_id` = `g`.`id`)
            and (`l`.`egroup_id` is not null)
            and (`g`.`db` like 'mm%')) 
    union select 
        replace(concat(`l`.`uid`, '_wtrack'),
            '-',
            '_') AS `tableName`,
        `l`.`name4browser` AS `shortLabel`,
        'bedGraph 4' AS `type`,
        `l`.`name4browser` AS `longLabel`,
        0 AS `visibility`,
        10 AS `priority`,
        30 AS `colorR`,
        70 AS `colorG`,
        150 AS `colorB`,
        30 AS `altColorR`,
        70 AS `altColorG`,
        150 AS `altColorB`,
        0 AS `useScore`,
        0 AS `private`,
        0 AS `restrictCount`,
        '' AS `restrictList`,
        '' AS `url`,
        '' AS `html`,
        `l`.`egroup_id` AS `grp`,
        0 AS `canPack`,
        concat('parent ',
                replace(concat(`l`.`uid`, '_grp'),
                    '-',
                    '_'),
                '
                 track ',
                replace(concat(`l`.`uid`, '_wtrack'),
                    '-',
                    '_'),
                '
                autoScale on
                
                windowingFunction maximum
                ') AS `settings`
    from
        ((`ems`.`labdata` `l`
        join `ems`.`experimenttype` `et`)
        join `ems`.`genome` `g`)
    where
        ((`l`.`deleted` = 0)
            and (`l`.`libstatus` between 10 and 99)
            and (`l`.`experimenttype_id` = `et`.`id`)
			and (`l`.`browsershare` = 1)
            and (`et`.`etype` like '%DNA%')
            and (`l`.`genome_id` = `g`.`id`)
            and (`l`.`egroup_id` is not null)
            and (`g`.`db` like 'mm%')) 
    union select 
        replace(concat(`l`.`uid`, '_islands'),
            '-',
            '_') AS `tableName`,
        `l`.`name4browser` AS `shortLabel`,
        'bed 4 +' AS `type`,
        `l`.`name4browser` AS `longLabel`,
        0 AS `visibility`,
        10 AS `priority`,
        0 AS `colorR`,
        30 AS `colorG`,
        100 AS `colorB`,
        30 AS `altColorR`,
        70 AS `altColorG`,
        150 AS `altColorB`,
        0 AS `useScore`,
        0 AS `private`,
        0 AS `restrictCount`,
        '' AS `restrictList`,
        '' AS `url`,
        '' AS `html`,
        `l`.`egroup_id` AS `grp`,
        1 AS `canPack`,
        concat('parent ',
                replace(concat(`l`.`uid`, '_grp'),
                    '-',
                    '_'),
                '
                 track ',
                replace(concat(`l`.`uid`, '_islands'),
                    '-',
                    '_'),
                '
                visibility dense
                ') AS `settings`
    from
        ((`ems`.`labdata` `l`
        join `ems`.`experimenttype` `et`)
        join `ems`.`genome` `g`)
    where
        ((`l`.`deleted` = 0)
			and (`l`.`browsershare` = 1)
            and (`l`.`libstatus` between 10 and 99)
            and (`l`.`experimenttype_id` = `et`.`id`)
            and (`et`.`etype` like '%DNA%')
            and (`l`.`genome_id` = `g`.`id`)
            and (`l`.`egroup_id` is not null)
            and (`g`.`db` like 'mm%'));


--
--			Human GENOME
--
--
drop view if exists `hg19`.`trackDb_external`;
CREATE 
VIEW `hg19`.`trackDb_external` AS
    select 
        replace(concat(`l`.`uid`, '_wtrack'),
            '-',
            '_') AS `tableName`,
        `l`.`name4browser` AS `shortLabel`,
        if((`et`.`etype` like '%dUTP%'),
            'PbedGraph 4',
            'bedGraph 4') AS `type`,
        `l`.`name4browser` AS `longLabel`,
        0 AS `visibility`,
        10 AS `priority`,
        30 AS `colorR`,
        70 AS `colorG`,
        150 AS `colorB`,
        30 AS `altColorR`,
        70 AS `altColorG`,
        150 AS `altColorB`,
        0 AS `useScore`,
        0 AS `private`,
        0 AS `restrictCount`,
        NULL AS `restrictList`,
        NULL AS `url`,
        NULL AS `html`,
        `l`.`egroup_id` AS `grp`,
        0 AS `canPack`,
        'autoScale on
        windowingFunction maximum' AS `settings`
    from
        ((`ems`.`labdata` `l`
        join `ems`.`experimenttype` `et`)
        join `ems`.`genome` `g`)
    where
        ((`l`.`deleted` = 0)
			and (`l`.`browsershare` = 1)
            and (`l`.`libstatus` between 10 and 99)
            and (`l`.`experimenttype_id` = `et`.`id`)
            and (`et`.`etype` like '%RNA%')
            and (`l`.`genome_id` = `g`.`id`)
            and (`g`.`db` like 'hg%')) 
    union select 
        replace(concat(`l`.`uid`, '_grp'),
            '-',
            '_') AS `tableName`,
        `l`.`name4browser` AS `shortLabel`,
        'bed 4 +' AS `type`,
        `l`.`name4browser` AS `longLabel`,
        0 AS `visibility`,
        10 AS `priority`,
        30 AS `colorR`,
        70 AS `colorG`,
        150 AS `colorB`,
        30 AS `altColorR`,
        70 AS `altColorG`,
        150 AS `altColorB`,
        0 AS `useScore`,
        0 AS `private`,
        0 AS `restrictCount`,
        NULL AS `restrictList`,
        NULL AS `url`,
        NULL AS `html`,
        `l`.`egroup_id` AS `grp`,
        0 AS `canPack`,
        concat('
                compositeTrack on
                group ',
                `l`.`egroup_id`,
                '
                 track ',
                replace(concat(`l`.`uid`, '_grp'),
                    '-',
                    '_'),
                '') AS `settings`
    from
        ((`ems`.`labdata` `l`
        join `ems`.`experimenttype` `et`)
        join `ems`.`genome` `g`)
    where
        ((`l`.`deleted` = 0)
			and (`l`.`browsershare` = 1)
            and (`l`.`libstatus` between 10 and 99)
            and (`l`.`experimenttype_id` = `et`.`id`)
            and (`et`.`etype` like '%DNA%')
            and (`l`.`genome_id` = `g`.`id`)
            and (`g`.`db` like 'hg%')) 
    union select 
        replace(concat(`l`.`uid`, '_wtrack'),
            '-',
            '_') AS `tableName`,
        `l`.`name4browser` AS `shortLabel`,
        'bedGraph 4' AS `type`,
        `l`.`name4browser` AS `longLabel`,
        0 AS `visibility`,
        10 AS `priority`,
        30 AS `colorR`,
        70 AS `colorG`,
        150 AS `colorB`,
        30 AS `altColorR`,
        70 AS `altColorG`,
        150 AS `altColorB`,
        0 AS `useScore`,
        0 AS `private`,
        0 AS `restrictCount`,
        NULL AS `restrictList`,
        NULL AS `url`,
        NULL AS `html`,
        `l`.`egroup_id` AS `grp`,
        0 AS `canPack`,
        concat('parent ',
                replace(concat(`l`.`uid`, '_grp'),
                    '-',
                    '_'),
                '
                 track ',
                replace(concat(`l`.`uid`, '_wtrack'),
                    '-',
                    '_'),
                '
                autoScale on
                
                windowingFunction maximum
                ') AS `settings`
    from
        ((`ems`.`labdata` `l`
        join `ems`.`experimenttype` `et`)
        join `ems`.`genome` `g`)
    where
        ((`l`.`deleted` = 0)
			and (`l`.`browsershare` = 1)
            and (`l`.`libstatus` between 10 and 99)
            and (`l`.`experimenttype_id` = `et`.`id`)
            and (`et`.`etype` like '%DNA%')
            and (`l`.`genome_id` = `g`.`id`)
            and (`g`.`db` like 'hg%')) 
    union select 
        replace(concat(`l`.`uid`, '_islands'),
            '-',
            '_') AS `tableName`,
        `l`.`name4browser` AS `shortLabel`,
        'bed 4 +' AS `type`,
        `l`.`name4browser` AS `longLabel`,
        0 AS `visibility`,
        10 AS `priority`,
        0 AS `colorR`,
        30 AS `colorG`,
        100 AS `colorB`,
        30 AS `altColorR`,
        70 AS `altColorG`,
        150 AS `altColorB`,
        0 AS `useScore`,
        0 AS `private`,
        0 AS `restrictCount`,
        NULL AS `restrictList`,
        NULL AS `url`,
        NULL AS `html`,
        `l`.`egroup_id` AS `grp`,
        1 AS `canPack`,
        concat('parent ',
                replace(concat(`l`.`uid`, '_grp'),
                    '-',
                    '_'),
                '
                 track ',
                replace(concat(`l`.`uid`, '_islands'),
                    '-',
                    '_'),
                '
                visibility dense
                ') AS `settings`
    from
        ((`ems`.`labdata` `l`
        join `ems`.`experimenttype` `et`)
        join `ems`.`genome` `g`)
    where
        ((`l`.`deleted` = 0)
			and (`l`.`browsershare` = 1)
            and (`l`.`libstatus` between 10 and 99)
            and (`l`.`experimenttype_id` = `et`.`id`)
            and (`et`.`etype` like '%DNA%')
            and (`l`.`genome_id` = `g`.`id`)
            and (`g`.`db` like 'hg%'))