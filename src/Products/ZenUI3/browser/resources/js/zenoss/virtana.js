// NOTE - first "onReady" block should be runned befor page renders
// second "onReady" block should be runned after header and page is rendered
Ext.onReady(function() {
    function parseBoolean(v, defaultValue) {
        if (v === undefined) return defaultValue;
        if (v === null) return true;
        switch(v.toLowerCase()) {
        case "false":
        case "no":
        case "0":
            return false;
        default: return true;
        }
    };
    var isVirtana = parseBoolean(localStorage.getItem('virtana') || undefined, false),
        isUrlVirtana = parseBoolean(new URL(location.href).searchParams.get('virtana'), isVirtana);
    if (isUrlVirtana) {
        localStorage.setItem('virtana', isUrlVirtana);
    } else {
        localStorage.removeItem('virtana');
    }
});

Ext.onReady(function() {
    if (!localStorage.getItem('virtana')) return;
    document.querySelector("html").classList.remove("z-cse-dark");
    var navigation = [{
        text: _t("Search"),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24"><path fill="#fff" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" /></svg>',
        handler: function() {
            var win = Ext.create('Zenoss.dialog.BaseWindow', {
                width: 500,
                modal: true,
                title: _t('Search'),
                closable: true,
                layout: 'hbox',
                items: [{
                    xtype: 'combobox',
                    flex: 1,
                    store: Ext.getStore('freeSearchDataStoreID'),
                    typeAhead:false,
                    triggerAction:'all',
                    pageSize:0,
                    // delay all requests by one second
                    delayQuery:1000,
                    minChars:3,
                    hideTrigger:false,
                    queryMode:'remote',
                    matchFieldWidth:true,
                    displayField:'name',
                    valueField:'url',
                    listConfig:Zenoss.env.search.listConfig,
                    listeners: {
                        // Fire this off when a selection is made
                        select: function (box, records) {
                            // we are looking at a saved search
                            var record = records[0],
                                id = record.get("id"),
                                url = record.get('url');
        
                            // open saved search result manager popUp;
                            if (id === 'manage_saved_search') {
                                var decodedUrl = Ext.urlDecode(location.search.substring(1, location.search.length)),
                                    win = Ext.create('Zenoss.search.ManageSavedSearchDialog', {
                                        xtype: 'managesavedsearchdialog',
                                        id: 'manageSavedSearchesDialog',
                                        searchId: decodedUrl.search
                                    });
                                win.show();
                                // and clear out the typed in search box
                                this.clearValue();
                            } else if (url) {
                                // IE only supports these window names: _blank _media _parent _search _self _top
                                var windowname = Ext.isIE ? '_blank' : url;
                                if (record.get('popout')) {
                                    window.open(Ext.String.format('{0}', url),
                                        windowname, 'status=1,width=600,height=500');
                                }
                                else {
                                    window.location = Ext.String.format('{0}', url);
                                }
                            } else if (id) {
                                // otherwise go to the selected search results page
                                window.location = Ext.String.format('/zport/dmd/search?search={0}', id);
                            }
                        }
                    }
                }]
            });
            win.show();
        }
    },{
        text: "Events",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24"><path fill="#fff" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" /></svg>',
        items: [{
            text: _t('Event Console'),
            href: '/cz0/zport/dmd/Events/evconsole',
        },{
            text: _t('Event Archive'),
            href: '/cz0/zport/dmd/Events/evhistory',
        },{
            text: _t('Event Classes'),
            href: '/cz0/zport/dmd/Events/eventclasses',
        },{
            text: _t('Triggers'),
            href: '/cz0/zport/dmd/Events/triggers',
        }]
    },{
        text: _t("Inventory"),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24"><path fill="#fff" d="M12 0L3 7L4.63 8.27L12 14L19.36 8.27L21 7L12 0M19.37 10.73L12 16.47L4.62 10.74L3 12L12 19L21 12L19.37 10.73M19.37 15.73L12 21.47L4.62 15.74L3 17L12 24L21 17L19.37 15.73Z" /></svg>',
        items: [{
            text: _t('Devices'),
            href: '/cz0/zport/dmd/itinfrastructure',
        },{
            text: _t('Networks'),
            href: '/cz0/zport/dmd/networks',
        },{
            text: _t('Processes'),
            href: '/cz0/zport/dmd/process',
        },{
            text: _t('IP Services'),
            href: '/cz0/zport/dmd/Events/ipservice',
        },{
            text: _t('Windows Services'),
            href: '/cz0/zport/dmd/Events/winservice',
        },{
            text: _t('Network Map'),
            href: '/cz0/zport/dmd/Events/networkMap',
        },{
            text: _t('Manufacturers'),
            href: '/cz0/zport/dmd/Events/manufacturers',
        }]
    },{
        text: _t("Services"),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24"><path fill="#fff" d="M16.5 11L13 7.5L14.4 6.1L16.5 8.2L20.7 4L22.1 5.4L16.5 11M11 7H2V9H11V7M21 13.4L19.6 12L17 14.6L14.4 12L13 13.4L15.6 16L13 18.6L14.4 20L17 17.4L19.6 20L21 18.6L18.4 16L21 13.4M11 15H2V17H11V15Z" /></svg>',
        items: [{
            text: _t("Dynamic Services"),
            href: "/cz0/zport/dmd/enterprise-services"
        },{
            text: _t("Logical Nodes"),
            href: "/cz0/zport/dmd/logicalnodes"
        },{
            text: _t("Metatype Configuration"),
            href: "/cz0/zport/dmd/metatypeconfig"
        }]
    },{
        text: _t("Reports"),
        href: "/cz0/zport/dmd/reports",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24"><path fill="#fff" d="M20,20A2,2 0 0,1 18,22H4A2,2 0 0,1 2,20V6A2,2 0 0,1 4,4H9.5C9.2,4.8 9,5.6 9,6.5C9,10.1 11.9,13 15.5,13C16.3,13 17,12.9 17.6,12.6L20,15V20M19.3,8.9C19.7,8.2 20,7.4 20,6.5C20,4 18,2 15.5,2C13,2 11,4 11,6.5C11,9 13,11 15.5,11C16.4,11 17.2,10.7 17.9,10.3L21,13.4L22.4,12L19.3,8.9M15.5,9C14.1,9 13,7.9 13,6.5C13,5.1 14.1,4 15.5,4C16.9,4 18,5.1 18,6.5C18,7.9 16.9,9 15.5,9Z" /></svg>'
    },{
        text: _t("Advanced"),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24"><path fill="#fff" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>',
        items: [{
            text: _t("Settings"),
            href: "/cz0/zport/dmd/editSettings"
        },{
            text: _t("Control Center"),
            href: "/cz0/zport/dmd/daemons"
        },{
            text: _t("Move Devices"),
            href: "/cz0/zport/dmd/moveDevicesUnderColl"
        },{
            text: _t("Monitoring Templates"),
            href: "/cz0/zport/dmd/template"
        },{
            text: _t("Jobs"),
            href: "/cz0/zport/dmd/joblist"
        },{
            text: _t("Configuration Manager"),
            href: "/cz0/zport/dmd/configurationManager"
        },{
            text: _t("MIBs"),
            href: "/cz0/zport/dmd/mibs"
        },{
            text: _t("Licensing"),
            href: "/cz0/zport/dmd/Licensing"
        }]
    }];
    var navigationButtons = [];
    Ext.Array.each(navigation, function(navi) {
        navigationButtons.push({
            xtype: 'button',
            text: navi.text,
            width: 87,
            height: 87,
            href: navi.href,
            handler: navi.handler,
            hrefTarget: '',
            style: {
                'background-color': 'transparent'
            },
            menuAlign: 'tl-tr?',
            arrowCls: '',
            menu: navi.items ? {
                plain: true,
                items: navi.items
            } : null,
            listeners: {
                render: function(t) {
                    var icon = Ext.DomHelper.createDom({
                        html: navi.icon
                    });
                    Ext.get(icon.firstChild).insertBefore(t.btnInnerEl);
                },
                boxready: function(t) {
                    t.btnInnerEl.setStyle({
                        color: "white",
                        "font-size": "13px",
                        width: 'auto',
                        height: 'auto',
                        'line-height': 'normal'
                    });
                    t.btnEl.setStyle({
                        display: 'flex',
                        gap: '4px',
                        'flex-direction': 'column',
                        'align-items': 'center',
                        'justify-content': 'center'
                    });
                }
            }
        });
    });
    var userA = document.querySelector('#user-link-container a'),
        helpCmp = document.querySelector('#help-icon-container a');
    Ext.get(document.querySelector('#header')).setStyle({ display: "none" });
    Ext.getCmp('viewport').remove(Ext.getCmp('header_panel'));
    Ext.getCmp('viewport').add([{
        xtype: 'toolbar',
        region: 'north',
        height: 60,
        weight: 40,
        id: 'header_panel',
        // layout: {
        //     type: 'hbox',
        //     align: 'middle'
        // },
        style: {
            'background-color': '#031c60',
            "box-shadow": "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)",
            "z-index": 1
        },
        items: [{
            xtype: "image",
            height: 26,
            width: 110,
            margin: "0 0 0 24",
            src: "https://qapreview.zenoss.io/zenoss-virtana.svg"
        },{
            xtype: 'tbseparator',
            height: "100%",
            margin: "0 10",
            style: {
                opacity: .2
            }
        },{
            xtype: 'label',
            style: {
                'font-size': '16px',
                color: 'white'
            },
            text: navigation.reduce((acc, n) => {
                if (n.href === location.pathname)  {
                    return n.text;
                }
                var items = n.items || [],
                    item = items.find(ni => ni.href === location.pathname);
                return item ? item.text : acc;
            }, "")
        },{
            xtype: 'tbspacer',
            flex: 1
        },{
            xtype: 'combobox',
            flex: 1,
            store: Ext.getStore('freeSearchDataStoreID'),
            typeAhead:false,
            triggerAction:'all',
            width:148,
            maxWidth:375,
            margin: '0 10',
            pageSize:0,
            // delay all requests by one second
            delayQuery:1000,
            minChars:3,
            hideTrigger:false,
            queryMode:'remote',
            matchFieldWidth:false,
            displayField:'name',
            valueField:'url',
            listConfig:Zenoss.env.search.listConfig,
            listeners: {
                // Fire this off when a selection is made
                select: function (box, records) {
                    // we are looking at a saved search
                    var record = records[0],
                        id = record.get("id"),
                        url = record.get('url');

                    // open saved search result manager popUp;
                    if (id === 'manage_saved_search') {
                        var decodedUrl = Ext.urlDecode(location.search.substring(1, location.search.length)),
                            win = Ext.create('Zenoss.search.ManageSavedSearchDialog', {
                                xtype: 'managesavedsearchdialog',
                                id: 'manageSavedSearchesDialog',
                                searchId: decodedUrl.search
                            });
                        win.show();
                        // and clear out the typed in search box
                        this.clearValue();
                    } else if (url) {
                        // IE only supports these window names: _blank _media _parent _search _self _top
                        var windowname = Ext.isIE ? '_blank' : url;
                        if (record.get('popout')) {
                            window.open(Ext.String.format('{0}', url),
                                windowname, 'status=1,width=600,height=500');
                        }
                        else {
                            window.location = Ext.String.format('{0}', url);
                        }
                    } else if (id) {
                        // otherwise go to the selected search results page
                        window.location = Ext.String.format('/zport/dmd/search?search={0}', id);
                    }
                }
            }
        },{
            xtype: 'button',
            text: '&#63;',
            width: 32,
            height: 32,
            href: helpCmp.href,
            margin: '0 10 0 0',
            style: {
                'background-color': '#254293',
                'border-radius': '100%'
            },
            listeners: {
                boxready: function(t) {
                    t.btnInnerEl.setStyle({
                        color: "white",
                        "font-size": "24px"
                    });
                }
            }
        },{
            xtype: 'button',
            text: '&#8505;',
            width: 32,
            height: 32,
            margin: '0 10 0 0',
            style: {
                'background-color': '#254293',
                'border-radius': '100%'
            },
            listeners: {
                render: function(t) {
                    Ext.getCmp('page-level-help-tip').setTarget(t.getId());
                },
                boxready: function(t) {
                    t.btnInnerEl.setStyle({
                        color: "white",
                        "font-size": "24px"
                    });
                }
            }
        },{
            xtype: 'button',
            text: userA.innerText.trim().substr(0, 2),
            width: 32,
            height: 32,
            margin: '0 10 0 0',
            style: {
                'background-color': '#254293',
                'border-radius': '100%'
            },
            menuAlign: 'tl-bl?',
            arrowCls: '',
            menu: {
                plain: true,
                items: [{
                    text: "Settings",
                    href: userA.href
                },{
                    text: "Logout",
                    href: document.querySelector('#sign-out-link a').href
                }]
            },
            listeners: {
                boxready: function(t) {
                    t.btnInnerEl.setStyle({
                        color: "white",
                        "font-size": "13px",
                        'text-transform': 'uppercase'
                    });
                }
            }
        }]
    }]);
    // Now set the combo box to the env
    Zenoss.env.search = Ext.getCmp('header_panel').down('combobox');
    Ext.getCmp('viewport').add([{
        region: 'west',
        weight: 30,
        id: 'navi_panel',
        width: 87,
        xtype: 'panel',
        padding: '32 0 0 0',
        style: {
            'background-color': '#031c60'
        },
        items: navigationButtons
    }]);
});
