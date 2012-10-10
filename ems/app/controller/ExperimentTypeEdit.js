Ext.define('EMS.controller.ExperimentTypeEdit', {
               extend: 'Ext.app.Controller',

               stores: ['ExperimentType'],

               models: ['ExperimentType'],

               //    views: ['user.Edit', 'user.List'],
               /*    refs: [
                    {
                    ref: 'usersPanel',
                    selector: 'panel'
                    }
                    ],
                */
               init: function() {
                   this.control({
                                    //            'WorkersEdit > userlist dataview': {
                                    //            'WorkersEdit grid': {
                                    //                itemdblclick: this.editUser
                                    //            },
                                    //            'useredit button[action=save]': {
                                    //                click: this.updateUser
                                    //            }
                                });
                   this.getExperimentTypeStore().load();
               },

               editUser: function(grid, record) {
                   //        var edit = Ext.create('EMS.view.user.Edit').show();

                   //        edit.down('form').loadRecord(record);
               },

               updateUser: function(button) {
                   var win = button.up('window'),
                           form   = win.down('form'),
                           record = form.getRecord(),
                           values = form.getValues();

                   record.set(values);
                   win.close();
                   this.getExperimentTypeStore().sync();
                   //        this.getUsersStore().save();
               }
           });
