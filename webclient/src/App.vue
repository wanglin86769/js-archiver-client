<template>
	<div class="layout-wrapper" >
        <Toast position="top-right" />
        
        <div class="above-footer-wrapper">
            <Menubar :model="menu">
                <template #start>
                    <img alt="logo" src="@/assets/images/archiver_logo.png" style="vertical-align: middle" height="40" class="mr-2">
                    <span class="logo">Archiver</span>
                </template>
                <template #end>
                    <span class="logo">Connection</span>
                    <i v-if="archiverConnection===true" class="fa fa-check-circle fa-2x" style="vertical-align: middle; color: green; margin-left: .5em;" v-tooltip="'Connected'"></i>
                    <i v-else class="fa fa-times-circle fa-2x" style="vertical-align: middle; color: red; margin-left: .5em;" v-tooltip="'Disconnected'"></i>
                </template>
            </Menubar>

            <div style="overflow-x: hidden">
                <router-view />
            </div>
        </div>

        <div class="layout-footer" style="text-align: center">
            <span class="footer-text">{{ softwareUser }}</span>
        </div>

        <Dialog v-model:visible="proxyStatusDialogDisplay" style="min-width: 40%" :modal="true">
            <template #header>
                <div style="color: RGB(29,149,243); font-weight: bold; font-size: 1.2em;">Proxy Status</div>
            </template>
            <div class="grid">
                <div class="col-4">
                    <span style="font-weight: bold">Proxy URL</span>
                </div>
                <div class="col-8">
                    {{ proxyURL }}
                </div>
                <div class="col-4">
                    <span style="font-weight: bold">Proxy connection</span>
                </div>
                <div class="col-8">
                    <span v-if="proxyConnection === true" style="color: green">Connected</span>
                    <span v-else style="color: red">Disconnected</span>
                </div>
            </div>
            <template #footer>
                <Button label="Close" icon="pi pi-times" @click="proxyStatusDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>

        <Dialog v-model:visible="archiverStatusDialogDisplay" style="min-width: 40%" :modal="true">
            <template #header>
                <div style="color: RGB(29,149,243); font-weight: bold; font-size: 1.2em;">Archiver Status</div>
            </template>
            <div class="grid">
                <div class="col-4">
                    <span style="font-weight: bold">Archiver URL</span>
                </div>
                <div class="col-8">
                    {{ archiverURL ? archiverURL : 'Unknown' }}
                </div>
                <div class="col-4">
                    <span style="font-weight: bold">Archiver connection</span>
                </div>
                <div class="col-8">
                    <span v-if="archiverConnection === true" style="color: green">Connected</span>
                    <span v-else style="color: red">Disconnected</span>
                </div>
            </div>
            <template #footer>
                <Button label="Close" icon="pi pi-times" @click="archiverStatusDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>

        <Dialog v-model:visible="applianceInfoDialogDisplay" style="min-width: 40%" :modal="true">
            <template #header>
                <div style="color: RGB(29,149,243); font-weight: bold; font-size: 1.2em;">Appliance Info</div>
            </template>
            <div v-if="applianceInfo">
                <div class="grid" v-for="(value, propertyName, index) in applianceInfo" :key="index" style="margin-bottom: 5px">
                    <div class="col-4">
                        <span style="font-weight: bold">{{ propertyName }}</span>
                    </div>
                    <div class="col-8">
                        {{ value }}
                    </div>
                </div>
            </div>
            <div v-else style="color: orange">Appliance info is not found.</div>
            <template #footer>
                <Button label="Close" icon="pi pi-times" @click="applianceInfoDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>

        <Dialog v-model:visible="clusterInfoDialogDisplay" style="min-width: 40%" :modal="true">
            <template #header>
                <div style="color: RGB(29,149,243); font-weight: bold; font-size: 1.2em;">Cluster Info</div>
            </template>
            <DataTable :value="clusterInfo">
                <Column field="instance" header="Instance"></Column>
                <Column field="status" header="Status"></Column>
                <Column field="MGMT_uptime" header="MGMT_uptime"></Column>
                <Column field="pvCount" header="PVCount"></Column>
                <Column field="connectedPVCount" header="ConnectedPVCount"></Column>
                <Column field="disconnectedPVCount" header="DisconnectedPVCount"></Column>
                <Column field="dataRate" header="DataRate"></Column>
                <Column field="dataRateGBPerDay" header="DataRateGBPerDay"></Column>
                <Column field="dataRateGBPerYear" header="DataRateGBPerYear"></Column>
                <template #empty>
                    <span style="color: orange">No records found.</span>
                </template>
            </DataTable>
            <template #footer>
                <Button label="Close" icon="pi pi-times" @click="clusterInfoDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>
	</div>
</template>

<script>
import ArchiverService from '@/service/ArchiverService';
import MiscellaneousService from '@/service/MiscellaneousService';
import config from './config/configuration.js';

export default {
    data() {
        return {
            proxyURL: config.proxyPath,
            proxyConnection: false,

            archiverURL: null,
            archiverConnection: false,

            applianceInfo: null,
            clusterInfo: null,

            proxyStatusDialogDisplay: false,
            archiverStatusDialogDisplay: false,
            applianceInfoDialogDisplay: false,
            clusterInfoDialogDisplay: false,

            softwareUser: config.softwareUser,

            menu: [
                {
                    label: 'Home',
                    icon: 'pi pi-fw pi-home',
                    command: () => {
                        this.$router.push({ name: 'home'});
                    }
                },
                {
                    label: 'PV',
                    icon: 'fa fa-fw fa-database',
                    items: [
                        {
                            label: 'PV List',
                            icon: 'fa fa-fw fa-ellipsis-v',
                            command: () => {
                                this.$router.push({ name: 'pvlist'});
                            }
                        },
                        {
                            label: 'PV Info',
                            icon: 'fa fa-fw fa-list',
                            command: () => {
                                this.$router.push({ name: 'pvinfo'});
                            }
                        },
                    ]
                },
                {
                    label: 'Status',
                    icon: 'fa fa-fw fa-cogs',
                    to: '/logbooks',
                    items: [
                        {
                            label: 'Proxy',
                            icon: 'fa fa-fw fa-edge',
                            command: () => {
                                this.onProxyStatusClick();
                            }
                        },
                        {
                            label: 'Archiver',
                            icon: 'fa fa-fw fa-archive',
                            command: () => {
                                this.onArchiverStatusClick();
                            }
                        },
                        {
                            label: 'Appliance',
                            icon: 'fa fa-fw fa-minus',
                            command: () => {
                                this.onApplianceStatusClick();
                            }
                        },
                        {
                            label: 'Cluster',
                            icon: 'fa fa-fw fa-navicon',
                            command: () => {
                                this.onClusterStatusClick();
                            }
                        },
                    ]
                },
                {
                    label: 'About',
                    icon: 'pi pi-fw pi-info-circle',
                    command: () => {
                        this.$router.push({ name: 'about'});
                    }
                },
            ],
        }
    },
    archiverService: null,
    miscellaneousService: null,
    created() {
        this.archiverService = new ArchiverService();
        this.miscellaneousService = new MiscellaneousService();
        this.checkProxyConnection();
        this.checkArchiverConnection();
        this.getArchiverURL();
		setInterval(this.checkProxyConnection, 30000);  // Every 30 seconds
        setInterval(this.checkArchiverConnection, 30000);  // Every 30 seconds
        setInterval(this.getArchiverURL, 30000);  // Every 30 seconds
	},
    methods: {
        async checkProxyConnection() {
            this.proxyConnection = await this.miscellaneousService.proxyConnection();
        },
        async checkArchiverConnection() {
            this.archiverConnection = await this.miscellaneousService.archiverConnection();
        },
        async getArchiverURL() {
            this.archiverURL = await this.miscellaneousService.archiverURL();
        },
        async onProxyStatusClick() {
            this.proxyStatusDialogDisplay = true;
        },
        async onArchiverStatusClick() {
            this.archiverStatusDialogDisplay = true;
        },
        async onApplianceStatusClick() {
            let loader = this.$loading.show();
            try {
                this.applianceInfo = await this.archiverService.getApplianceInfo();
            } catch(error) {
                this.applianceInfo = null;
            } finally {
				loader.hide();
                this.applianceInfoDialogDisplay = true;
			}
        },
        async onClusterStatusClick() {
            let loader = this.$loading.show();
            try {
                this.clusterInfo = await this.archiverService.getClusterInfo();
            } catch(error) {
                this.clusterInfo = null;
            } finally {
				loader.hide();
                this.clusterInfoDialogDisplay = true;
			}
        },
    },
}
</script>

<style lang="scss">
@import './assets/layout/layout.scss';
@import './App.scss';

</style>
