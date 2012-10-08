Ext.require('Ext.chart.*');
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit', 'Ext.window.MessageBox']);


Ext.define( 'EMS.model.Fence', {
    extend: 'Ext.data.Model',

    fields: 
     [
      { name: 'id', type: 'int' },
      { name: 'A', type: 'int' },
      { name: 'C', type: 'int' },
      { name: 'T', type: 'int' },
      { name: 'G', type: 'int' }
     ],
    proxy:{
           type: 'ajax',
           api: {
            read : '/cgi-bin/barski/fence.json',
           },
           reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
           }
          }
});


    window.generateData = function(n, floor){
        var data = [],
            p = (Math.random() *  11) + 1,
            i;
            
        floor = (!floor && floor !== 0)? 20 : floor;
        
        for (i = 0; i < (n || 12); i++) {
            data.push({
                name: Ext.Date.monthNames[i % 12],
                data1: Math.floor(Math.max((Math.random() * 100), floor)),
                data2: Math.floor(Math.max((Math.random() * 100), floor)),
                data3: Math.floor(Math.max((Math.random() * 100), floor)),
                data4: Math.floor(Math.max((Math.random() * 100), floor)),
                data5: Math.floor(Math.max((Math.random() * 100), floor)),
                data6: Math.floor(Math.max((Math.random() * 100), floor)),
                data7: Math.floor(Math.max((Math.random() * 100), floor)),
                data8: Math.floor(Math.max((Math.random() * 100), floor)),
                data9: Math.floor(Math.max((Math.random() * 100), floor))
            });
        }
        return data;
    };



    window.store1 = Ext.create('Ext.data.JsonStore', {
        fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data9', 'data9'],
        data: generateData()
    });

//    store1.loadData(generateData(8));

    var chart = Ext.create('Ext.chart.Chart', {
            xtype: 'chart',
            style: 'background:#fff',
            animate: true,
//            store: store1,
        store: {
            autoLoad: true,
            model: 'EMS.model.Fence',
            listeners: {
                    load: function() {
                        console.log('Fence store loaded');
                    }
            }
        },
            shadow: true,
            theme: 'Category1',
            legend: {
                position: 'right'
            },
            axes: [{
                type: 'Numeric',
                minimum: 0,
                position: 'left',
                fields: ['A', 'C', 'T', 'G'],
                title: 'Number of Hits',
                minorTickSteps: 1,
                grid: {
                    odd: {
                        opacity: 1,
                        fill: '#ddd',
                        stroke: '#bbb',
                        'stroke-width': 0.5
                    }
                }
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['id'],
                title: 'Nucleotide position in read'
            }],
            series: [{
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
                xField: 'id',
                yField: 'A',
                markerConfig: {
                    type: 'circle',
                    size: 1,
                    radius: 1,
                    'stroke-width': 0
                }
            }, {
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
//                smooth: true,
                xField: 'id',
                yField: 'C',
                markerConfig: {
                    type: 'circle',
                    size: 1,
                    radius: 1,
                    'stroke-width': 0
                }
            }, {
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
//                smooth: true,
//                fill: true,
                xField: 'id',
                yField: 'T',
                markerConfig: {
                    type: 'circle',
                    size: 1,
                    radius: 1,
                    'stroke-width': 0
                }
            },{
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
//                smooth: true,
//                fill: true,
                xField: 'id',
                yField: 'G',
                markerConfig: {
                    type: 'circle',
                    size: 1,
                    radius: 1,
                    'stroke-width': 0
                }
            }]
        });


//});



Ext.define('EMS.view.charts.Fence', {
    extend: 'Ext.window.Window',
    alias : 'widget.FenceChart',

    requires: ['Ext.form.Panel'],

        width: 800,
        height: 500,
        minHeight: 400,
        minWidth: 550,
        hidden: true,
	closeAction: 'hide',
	constrain: true,
        maximizable: true,
        title: 'Adaptor Contamenation',
//        renderTo: Ext.getBody(),
        layout: 'fit',

        tbar: [{
            text: 'Save Chart',
            handler: function() {
                Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
                    if(choice == 'yes'){
                        chart.save({
                            type: 'image/png'
                        });
                    }
                });
            }
        }, {
            text: 'Reload Data',
            handler: function() {
//                chart.store.loadData(generateData(8));
                chart.store.load();
            }
        }],
        items: chart
    });
