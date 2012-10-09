
Ext.define( 'EMS.view.EMSMenu' ,{
    extend: 'Ext.panel.Panel',
    alias : 'widget.EMSMenu',

    tbar: [
             { xtype: 'button',
               text:'Forms',
               tooltip:'Laboratory data edit',
               menu: [
                { text: 'Laboratory data', action: 'LabData', tooltip: 'Laboratory data edit',iconCls: 'form-blue-edit' },
                { text: 'Workers', action: 'Workers', tooltip: 'List of workers',iconCls: 'users3-edit' }
               ],
               iconCls:'form-blue'
             },
             { xtype: 'button',
               text:'Reports',
               tooltip:'Some reports',
               menu: [
                { text: 'Adaptor contamination', action: 'AdaptorCont', tooltip: '',iconCls: 'chart' },
                { text: 'Average Tag Density', action: 'ATD', tooltip: '',iconCls: 'chart-line' }
               ],
               iconCls:'magazine-folder'
             },
             { xtype: 'button',
               text:'Genome Browser',
               tooltip:'UCSC Genome browser',
               menu: [
                { text: 'Genome browser', action: 'GenomeBrowser', tooltip: '',iconCls: 'icon-grid' }
               ],
               iconCls:'notepad'
             },
             { xtype: 'button',
               text:'Patiens',
               tooltip:'Pation\'s data',
               menu: [
                { text: 'List', action: 'List', tooltip: '',iconCls: 'icon-grid' }
               ],
               iconCls:'users3'
             }
          ]
});