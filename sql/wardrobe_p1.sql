use ems;

ALTER TABLE `ems`.`egroup` 
ADD COLUMN `shadow` VARCHAR(200) NOT NULL AFTER `laboratory_id`;
update ems.egroup set shadow=(select replace(CONCAT(uuid(),uuid()),'-',''));
ALTER TABLE `ems`.`egroup` 
ADD UNIQUE INDEX `shadow_UNIQUE` (`shadow` ASC);

ALTER TABLE `ems`.`worker` 
ADD COLUMN `shadow` VARCHAR(200) NOT NULL AFTER `laboratory_id`;
update ems.worker set shadow=(select replace(CONCAT(uuid(),uuid()),'-',''));
ALTER TABLE `ems`.`worker` 
ADD UNIQUE INDEX `shadow_UNIQUE` (`shadow` ASC);
