<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					PV Management
				</div>

				<Textarea v-model="pvInput" style="width: 100%" rows="15" spellcheck="false" placeholder="Please enter PV names line by line." />

				<Toolbar class="mb-0">
					<template v-slot:start>
						<Button label="Check Status" severity="info" icon="fa fa-info-circle" class="p-button-sm" @click="onCheckStatusClick" />
						<Button label="Archive" style="margin-left: 20px" severity="success" icon="fa fa-plus" class="p-button-sm" @click="onArchiveClick" />
						<Button label="Update" style="margin-left: 20px" severity="warning" icon="fa fa-pencil-square-o" class="p-button-sm" @click="onUpdateClick" />
						<Button label="Rename" style="margin-left: 20px" severity="help" icon="fa fa-arrow-circle-right" class="p-button-sm" @click="onRenameClick" />
						<Button label="Delete" style="margin-left: 20px" severity="danger" icon="fa fa-trash" class="p-button-sm" @click="onDeleteClick" />
						<Button label="Pause" style="margin-left: 20px; background-color: darkorange; border-color: darkorange;" icon="fa fa-pause" class="p-button-sm" @click="onPauseClick" />
						<Button label="Resume" style="margin-left: 20px; background-color: mediumseagreen; border-color: mediumseagreen;" icon="fa fa-play" class="p-button-sm" @click="onResumeClick" />
					</template>

					<template v-slot:end>
						
					</template>
				</Toolbar>
				
				<DataTable v-if="showPVStatus" :value="pvInfos" dataKey="_id" :paginator="true" :rows="25" :rowHover="true" showGridlines 
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[10,25,50,100,200]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pvs" 
							paginatorPosition="both" responsiveLayout="stack" v-model:first="currentPageFirstIndex"
							:loading="tableLoading">
					
					<template #header>
						<!-- <div class="flex flex-wrap align-items-center justify-content-between gap-2">
							<Button icon="pi pi-refresh" style="margin-right: 15em;" rounded raised @click="refresh" />
							<span style="color: RGB(29,149,243); font-size: 1.5em; font-weight: bold;">PV Status</span>
							<IconField iconPosition="left">
								<InputIcon>
									<i class="pi pi-search" />
								</InputIcon>
								<InputText placeholder="Keyword Search" style="width: 20em" class="p-inputtext-sm" v-model="keyword" @input="onSearchInput" />
							</IconField>
						</div> -->
						<!-- <div>
							<Button icon="pi pi-refresh" rounded raised style="float: left" v-tooltip="'refresh'" @click="refresh" />
							<div style="color: RGB(29,149,243); font-size: 1.5em; font-weight: bold; text-align: center;">PV Status</div>
						</div> -->
						<div class="flex flex-wrap align-items-center justify-content-between gap-2">
							<Button icon="pi pi-refresh" rounded raised v-tooltip.right="'Refresh'" @click="refresh" />
							<span style="color: RGB(29,149,243); font-size: 1.5em; font-weight: bold;">PV Status</span>
							<Button icon="fa fa-stop" style="background-color: red; border-color: red;" rounded raised v-tooltip.left="'Stop auto refresh'" @click="stopAutoRefresh" />
						</div>
					</template>
					<Column field="index" header="Index">
						<template #body="slotProps">
							{{currentPageFirstIndex + slotProps.index + 1}}
						</template>
					</Column>
					<Column header="PV Name">
						<template #body="slotProps">
							<div>{{slotProps.data.pvName}}</div>
						</template>
					</Column>
					<Column header="Status">
						<template #body="slotProps">
							<div>{{slotProps.data.status}}</div>
						</template>
					</Column>
					<Column header="Appliance">
						<template #body="slotProps">
							<div>{{slotProps.data.appliance}}</div>
						</template>
					</Column>
					<Column header="Connected">
						<template #body="slotProps">
							<div>{{slotProps.data.connectionState}}</div>
						</template>
					</Column>
					<Column header="Monitored">
						<template #body="slotProps">
							<div>{{slotProps.data.isMonitored}}</div>
						</template>
					</Column>
					<Column header="Sampling period">
						<template #body="slotProps">
							<div>{{slotProps.data.samplingPeriod}}</div>
						</template>
					</Column>
					<Column header="Last event">
						<template #body="slotProps">
							<div>{{slotProps.data.lastEvent}}</div>
						</template>
					</Column>
					<Column headerStyle="width: 8em">
						<template #header>
							<i class="pi pi-cog" style="font-size: 1.5rem" v-tooltip.top="'Operation'"></i>
						</template>
						<template #body="slotProps">
							<i v-if="showDetailButton(slotProps.data.status)" class="pi pi-search-plus" v-tooltip.top="'Detail'" style="font-size: 1.2rem; cursor: pointer; color: RGB(29,149,243); margin-right: 1.0em" @click="onDetailClick(slotProps.data.pvName)"></i>
							<i v-if="showAbortButton(slotProps.data.status)" class="fa fa-trash" v-tooltip.top="'Abort'" style="font-size: 1.2rem; cursor: pointer; color: orange;" @click="abortPV(slotProps.data.pvName)"></i>
						</template>
					</Column>
					<template #empty>
						<div style="color: orange">No records found.</div>
					</template>
				</DataTable>
			</div>
		</div>

		<Dialog v-model:visible="detailsDialogDisplay" modal style="width: 60%">
			<template #header>
				<div style="color: RGB(29,149,243); font-size: 1.5em; font-weight: bold;">PV Details</div>
			</template>
			<table v-if="pvDetails && pvDetails.length" border="1" width="100%" style="border-collapse: collapse;">
				<tr height="40em">
					<th colspan="1" align="left" style="width: 60%"><span style="font-weight: bold; margin-left: 0.5em;">Attribute</span></th>
					<th colspan="3" align="left"><span style="font-weight: bold; margin-left: 0.5em;">Detail</span></th>
				</tr>
				<tr height="40em" v-for="(item, index) in pvDetails" :key="index">
					<td colspan="1" align="left" style="width: 60%"><span style="margin-left: 0.5em;">{{ item.name }}</span></td>
					<td colspan="3" align="left"><span style="margin-left: 0.5em;">{{ item.value }}</span></td>
				</tr>
			</table>
			<template #footer>
				<Button label="Close" icon="pi pi-times" text severity="secondary" @click="detailsDialogDisplay=false" />
			</template>
		</Dialog>

		<Dialog v-model:visible="archiveDialogDisplay" modal header="Archival Parameters" class="p-fluid" style="width: 50%">
			<div class="field">
				<label>Sampling mode</label><span style="color: red"> *</span>
				<Dropdown v-model="samplingMode" :options="samplingModeOptions" optionLabel="name" optionValue="value" placeholder="Select" showClear autofocus />
			</div>
			<div class="field">
				<label>Sampling period</label><span style="color: red"> *</span>
				<InputText v-model="samplingPeriod" class="p-inputtext-sm" required="true" />
			</div>
			<div class="field">
				<label>Controlling PV</label>
				<InputText v-model="controllingPV" class="p-inputtext-sm" />
			</div>
			<div class="field">
				<label>Appliance</label>
				<Dropdown v-model="appliance" :options="applianceOptions" placeholder="Select" showClear />
			</div>
			<template #footer>
				<Button type="button" icon="pi pi-times" label="Cancel" class="p-button-text" @click="archiveDialogDisplay = false"></Button>
				<Button type="button" icon="pi pi-check" label="OK" severity="info" @click="archivePVs"></Button>
			</template>
		</Dialog>

		<Dialog v-model:visible="updateDialogDisplay" modal header="Update Parameters" class="p-fluid" style="width: 50%">
			<div class="field">
				<label>Sampling mode</label><span style="color: red"> *</span>
				<Dropdown v-model="samplingMode" :options="samplingModeOptions" optionLabel="name" optionValue="value" placeholder="Select" showClear autofocus />
			</div>
			<div class="field">
				<label>Sampling period</label><span style="color: red"> *</span>
				<InputText v-model="samplingPeriod" class="p-inputtext-sm" required="true" />
			</div>
			<div class="field">
				<label>Controlling PV</label>
				<InputText v-model="controllingPV" class="p-inputtext-sm" />
			</div>
			<div class="field">
				<label>Appliance</label>
				<Dropdown v-model="appliance" :options="applianceOptions" placeholder="Select" showClear />
			</div>
			<template #footer>
				<Button type="button" icon="pi pi-times" label="Cancel" class="p-button-text" @click="updateDialogDisplay = false"></Button>
				<Button type="button" icon="pi pi-check" label="OK" severity="info" @click="updatePVs"></Button>
			</template>
		</Dialog>

		<Dialog v-model:visible="renameDialogDisplay" header="Message" :modal="true" style="min-width: 40%">
			<div>
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: RGB(156,39,176); vertical-align: middle;" />
				<span style="color: RGB(156,39,176);">Are you sure you want to rename the following PVs?</span>
				<div v-for="(item, index) of renameList" :key="index" style="margin-left: 20px; margin-bottom: 5px; margin-top: 10px;">
					<span style="margin-right: 4em; color: RGB(29,149,243);">{{ index + 1 }}</span>
					<span>{{ item.pv }}</span>
					<span style="margin-left: 1em; margin-right: 1em; color: RGB(29,149,243);">-></span>
					<span>{{ item.newname }}</span>
				</div>
			</div>
			<template #footer>
				<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="renameDialogDisplay = false"/>
				<Button label="OK" icon="pi pi-check" class="p-button-primary" @click="renamePVs" />
			</template>
		</Dialog>

		<Dialog v-model:visible="deleteDialogDisplay" header="Message" :modal="true" style="min-width: 40%">
			<div>
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: RGB(211,47,47); vertical-align: middle;" />
				<span style="color: RGB(211,47,47);">Are you sure you want to delete the following PVs?</span>
				<div v-for="(item, index) of pvList" :key="index" style="margin-left: 20px; margin-bottom: 5px; margin-top: 10px;">
					<span style="margin-right: 4em; color: RGB(29,149,243);">{{ index + 1 }}</span><span>{{ item }}</span>
				</div>
			</div>
			<template #footer>
				<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="deleteDialogDisplay = false"/>
				<Button label="OK" icon="pi pi-check" class="p-button-primary" @click="deletePVs" />
			</template>
		</Dialog>

		<Dialog v-model:visible="pauseDialogDisplay" header="Message" :modal="true" style="min-width: 40%">
			<div>
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: darkorange; vertical-align: middle;" />
				<span style="color: darkorange;">Are you sure you want to pause the following PVs?</span>
				<div v-for="(item, index) of pvList" :key="index" style="margin-left: 20px; margin-bottom: 5px; margin-top: 10px;">
					<span style="margin-right: 4em; color: RGB(29,149,243);">{{ index + 1 }}</span><span>{{ item }}</span>
				</div>
			</div>
			<template #footer>
				<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="pauseDialogDisplay = false"/>
				<Button label="OK" icon="pi pi-check" class="p-button-primary" @click="pausePVs" />
			</template>
		</Dialog>

		<Dialog v-model:visible="resumeDialogDisplay" header="Message" :modal="true" style="min-width: 40%">
			<div>
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: mediumseagreen; vertical-align: middle;" />
				<span style="color: mediumseagreen;">Are you sure you want to resume the following PVs?</span>
				<div v-for="(item, index) of pvList" :key="index" style="margin-left: 20px; margin-bottom: 5px; margin-top: 10px;">
					<span style="margin-right: 4em; color: RGB(29,149,243);">{{ index + 1 }}</span><span>{{ item }}</span>
				</div>
			</div>
			<template #footer>
				<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="resumeDialogDisplay = false"/>
				<Button label="OK" icon="pi pi-check" class="p-button-primary" @click="resumePVs" />
			</template>
		</Dialog>
	</div>

</template>

<script>
import ArchiverService from '@/service/ArchiverService';
import config from '@/config/configuration.js';

export default {
	data() {
		return {
			pvInput: '',

			pvList: [],
			pvInfos: [],

			renameList: [],

			samplingMode: 'MONITOR',
			samplingPeriod: '',
			controllingPV: '',
			appliance: '',
			samplingModeOptions: [
				{ name: 'Monitor', value: 'MONITOR'},
				{ name: 'Scan', value: 'SCAN'},
			],
			applianceOptions: [],

			currentPageFirstIndex: 0,

			pvDetails: null,

			refreshIntervalId: null,
			tableLoading: false,

			detailsDialogDisplay: false,
			archiveDialogDisplay: false,
			updateDialogDisplay: false,
			renameDialogDisplay: false,
			deleteDialogDisplay: false,
			pauseDialogDisplay: false,
			resumeDialogDisplay: false,
			showPVStatus: false,
		}
	},
	archiverService: null,
	created() {
		this.archiverService = new ArchiverService();
		this.getApplianceOptions();
		this.loadSessionStorage();
		this.startAutoRefresh();
	},
	beforeUnmount(){
		this.stopAutoRefresh();
	},
	methods: {
		resetArchivalParameters() {
			this.samplingMode = 'MONITOR';
			this.samplingPeriod = '';
			this.controllingPV = '';
			this.appliance = '';
		},
		processPVInput() {
			// Split PV rename by line breaks
			this.pvList = this.pvInput.split(/\r?\n/);
			// Remove whitespace from both sides of the string
			this.pvList = this.pvList.map(element => element.trim());
			// Remove empty strings
			this.pvList = this.pvList.filter((element) => element);
		},
		processPVRename() {
			// Split PV input by line breaks
			let renameLines = this.pvInput.split(/\r?\n/);
			// Remove whitespace from both sides of the string
			renameLines = renameLines.map(element => element.trim());
			// Remove empty strings
			renameLines = renameLines.filter((element) => element);
			// Replace \t character with space
			renameLines = renameLines.map(element => element.replace(/\t/g, ' '));
			// Replace ',' character with space
			renameLines = renameLines.map(element => element.replace(/,/g,' '));
			// Replace multiple spaces with single space
			renameLines = renameLines.map(element => element.replace(/\s+/g, ' '));
			// Remove items that are not separated by space
			renameLines = renameLines.filter(element => element.split(' ')[0] && element.split(' ')[1]);

			this.renameList = renameLines.map(element => {
				return { pv: element.split(' ')[0], newname: element.split(' ')[1] };
			});
		},
		loadSessionStorage() {
			let pvInput = sessionStorage.getItem(config.sessionStoragePVInput);
			this.pvInput = pvInput || '';
		},
		savePVInput() {
			sessionStorage.setItem(config.sessionStoragePVInput, this.pvInput);
		},
		async getApplianceOptions() {
			this.applianceOptions = await this.archiverService.getInstanceIdentities();
		},
		async onDetailClick(pv) {
			let loader = this.$loading.show();
			try {
                this.pvDetails = await this.archiverService.getPVDetails(pv);
				this.detailsDialogDisplay = true;
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load PV detail', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load PV detail', detail: error.message });
				}
            } finally {
				loader.hide();
			}
		},
		onCheckStatusClick() {
			this.processPVInput();
			if(!this.pvList || !this.pvList.length) {
				this.$toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'No PVs have been specified', life: 5000 });
				return;
			}
			this.savePVInput();
			this.checkPVStatus();
		},
		onArchiveClick() {
			this.processPVInput();
			if(!this.pvList || !this.pvList.length) {
				this.$toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'No PVs have been specified', life: 5000 });
				return;
			}
			this.savePVInput();
			this.resetArchivalParameters();
			this.archiveDialogDisplay = true;
		},
		onUpdateClick() {
			this.processPVInput();
			if(!this.pvList || !this.pvList.length) {
				this.$toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'No PVs have been specified', life: 5000 });
				return;
			}
			this.savePVInput();
			this.resetArchivalParameters();
			this.updateDialogDisplay = true;
		},
		onRenameClick() {
			this.processPVRename();
			if(!this.renameList || !this.renameList.length) {
				this.$toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'No PVs or newnames have been specified', life: 5000 });
				return;
			}
			this.savePVInput();
			this.renameDialogDisplay = true;
		},
		onDeleteClick() {
			this.processPVInput();
			if(!this.pvList || !this.pvList.length) {
				this.$toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'No PVs have been specified', life: 5000 });
				return;
			}
			this.savePVInput();
			this.deleteDialogDisplay = true;
		},
		onPauseClick() {
			this.processPVInput();
			if(!this.pvList || !this.pvList.length) {
				this.$toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'No PVs have been specified', life: 5000 });
				return;
			}
			this.savePVInput();
			this.pauseDialogDisplay = true;
		},
		onResumeClick() {
			this.processPVInput();
			if(!this.pvList || !this.pvList.length) {
				this.$toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'No PVs have been specified', life: 5000 });
				return;
			}
			this.savePVInput();
			this.resumeDialogDisplay = true;
		},
		async checkPVStatus() {
			if(!this.pvList || !this.pvList.length) return;
			let loader = this.$loading.show();
            try {
                this.pvInfos = await this.archiverService.getMultiplePVStatus(this.pvList);
				this.startToShowPVStatus();
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load PV status', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load PV status', detail: error.message });
				}
            } finally {
				loader.hide();
			}
		},
		async refresh() {
			if(!this.pvList || !this.pvList.length) return;
			this.tableLoading = true;
			try {
                this.pvInfos = await this.archiverService.getMultiplePVStatus(this.pvList);
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to refresh PV status', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to refresh PV status', detail: error.message });
				}
            } finally {
				this.tableLoading = false;
			}
		},
		async refreshWithoutErrorReport() {
			if(!this.pvList || !this.pvList.length) return;
            this.pvInfos = await this.archiverService.getMultiplePVStatus(this.pvList);
		},
		startAutoRefresh() {
			this.refreshIntervalId = setInterval(this.refreshWithoutErrorReport, 10000);  // Every 10 seconds
		},
		stopAutoRefresh() {
			if(this.refreshIntervalId) {
				clearInterval(this.refreshIntervalId);
				this.refreshIntervalId = null;
			}
		},
		async archivePVs() {
			let loader = this.$loading.show();
			try {
                await this.archiverService.archiveMultiplePV(this.pvList, this.samplingMode, this.samplingPeriod, this.controllingPV, this.appliance);
				this.archiveDialogDisplay = false;
				this.$toast.add({severity: 'success', summary: 'Operation succeeds', detail: '', life: 5000});
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to archive PVs', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to archive PVs', detail: error.message });
				}
            } finally {
				loader.hide();
			}
		},
		async updatePVs() {
			let loader = this.$loading.show();
			try {
				// Delete PVs from Archiver Appliance
				for(let pv of this.pvList) {
					let pvStatus = await this.archiverService.getSinglePVStatus(pv);

					// The PV is not available in Archiver Appliance
					if(pvStatus && pvStatus.status === 'Not being archived') {
						continue;
					}

					// The PV is available in in Archiver Appliance but has not started to be archived
					if(pvStatus && pvStatus.status === 'Initial sampling') {
						await this.archiverService.abortPV(pv);
						continue;
					}

					await this.archiverService.pausePV(pv);
					await this.archiverService.deletePV(pv);
				}

				// Add PVs to Archiver Appliance again
                await this.archiverService.archiveMultiplePV(this.pvList, this.samplingMode, this.samplingPeriod, this.controllingPV, this.appliance);
				this.updateDialogDisplay = false;
				this.$toast.add({severity: 'success', summary: 'Operation succeeds', detail: '', life: 5000});
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to update PVs', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to update PVs', detail: error.message });
				}
            } finally {
				loader.hide();
			}
		},
		async renamePVs() {
			let loader = this.$loading.show();
			try {
                for(let item of this.renameList) {
					let pv = item.pv;
					let newname = item.newname;

					// The PV is not available in Archiver Appliance
					let pvStatus = await this.archiverService.getSinglePVStatus(pv);
					if(pvStatus && pvStatus.status === 'Not being archived') {
						continue;
					}

					await this.archiverService.pausePV(pv);
					await this.archiverService.renamePV(pv, newname);
					await this.archiverService.resumePV(newname);
				}
				this.renameDialogDisplay = false;
				this.$toast.add({severity: 'success', summary: 'Operation succeeds', detail: '', life: 5000});
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to rename PVs', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to rename PVs', detail: error.message });
				}
            } finally {
				loader.hide();
			}
		},
		async deletePVs() {
			let loader = this.$loading.show();
			try {
                for(let pv of this.pvList) {
					let pvStatus = await this.archiverService.getSinglePVStatus(pv);

					// The PV is not available in Archiver Appliance
					if(pvStatus && pvStatus.status === 'Not being archived') {
						continue;
					}

					// The PV is available in in Archiver Appliance but has not started to be archived yet
					if(pvStatus && pvStatus.status === 'Initial sampling') {
						await this.archiverService.abortPV(pv);
						continue;
					}

					await this.archiverService.pausePV(pv);
					await this.archiverService.deletePV(pv);
				}
				this.deleteDialogDisplay = false;
				this.$toast.add({severity: 'success', summary: 'Operation succeeds', detail: '', life: 5000});
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to delete PVs', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to delete PVs', detail: error.message });
				}
            } finally {
				loader.hide();
			}
		},
		async pausePVs() {
			let loader = this.$loading.show();
			try {
                for(let pv of this.pvList) {
					await this.archiverService.pausePV(pv);
				}
				this.pauseDialogDisplay = false;
				this.$toast.add({severity: 'success', summary: 'Operation succeeds', detail: '', life: 5000});
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to pause PVs', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to pause PVs', detail: error.message });
				}
            } finally {
				loader.hide();
			}
		},
		async resumePVs() {
			let loader = this.$loading.show();
			try {
                for(let pv of this.pvList) {
					await this.archiverService.resumePV(pv);
				}
				this.resumeDialogDisplay = false;
				this.$toast.add({severity: 'success', summary: 'Operation succeeds', detail: '', life: 5000});
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to resume PVs', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to resume PVs', detail: error.message });
				}
            } finally {
				loader.hide();
			}
		},
		async abortPV(pv) {
			let loader = this.$loading.show();
			try {
				await this.archiverService.abortPV(pv);
				await this.refreshWithoutErrorReport();
            } catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to abort the PV', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to abort the PV', detail: error.message });
				}
            } finally {
				loader.hide();
			}
		},
		startToShowPVStatus() {
			this.showPVStatus = true;
		},
		showDetailButton(status) {
			return status !== 'Initial sampling' && status !== 'Not being archived';
		},
		showAbortButton(status) {
			return status === 'Initial sampling';
		},
	},
}
</script>

<style scoped>
/* ::v-deep .p-datatable thead th {
	color: RGB(29,149,243);
} */

:deep(.p-datatable) thead th {
    color: RGB(29,149,243);
}

table, th, td {
  border: 2px solid RGBA(29,149,243,0.4);
}
	
</style>
