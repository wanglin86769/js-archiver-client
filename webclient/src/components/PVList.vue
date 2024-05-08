<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					PV List
				</div>

				<Toolbar class="mb-0">
					<template v-slot:start>
						<Button label="Export" icon="fa fa-sign-out" class="p-button-warning p-button-sm" @click="onExportClick" />
					</template>

					<template v-slot:end>
						<div class="p-inputgroup">
							<Button label="Reset" icon="pi pi-refresh" class="p-button-success p-button-sm" @click="resetSearch"/>
							<InputText placeholder="Keyword" style="width: 30em" class="p-inputtext-sm" v-model="filters.search" @input="onSearchInput" />
						</div>
					</template>
				</Toolbar>

				<DataTable :value="pvs" dataKey="_id" :paginator="true" :rows="25" :rowHover="true" showGridlines 
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[10,25,50,100,200]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pvs" 
							paginatorPosition="both" responsiveLayout="stack" v-model:first="currentPageFirstIndex"
							ref="dt" :lazy="true" :totalRecords="totalRecords" :loading="tableLoading" @page="onPage($event)">
					
					<Column field="index" header="Index">
						<template #body="slotProps">
							{{currentPageFirstIndex + slotProps.index + 1}}
						</template>
					</Column>
					<Column field="index" header="PV Name">
						<template #body="slotProps">
							<div>{{slotProps.data.name}}</div>
						</template>
					</Column>
					<Column headerStyle="width: 8em">
						<template #header>
							<i class="pi pi-cog" style="font-size: 1.5rem" v-tooltip.top="'Operation'"></i>
						</template>
						<template #body="slotProps">
							<i class="pi pi-info-circle" v-tooltip.top="'Info'" style="font-size: 1.2rem; cursor: pointer; color: RGB(34,197,94); " @click="onInfoClick(slotProps.data.name)"></i>
							<i class="pi pi-search-plus" v-tooltip.top="'Detail'" style="font-size: 1.2rem; cursor: pointer; color: RGB(29,149,243); margin-left: 1.0em" @click="onDetailClick(slotProps.data.name)"></i>
						</template>
					</Column>
					<template #empty>
						<div style="color: orange">No records found.</div>
					</template>
				</DataTable>
			</div>
		</div>

		<Dialog v-model:visible="infoDialogDisplay" modal style="width: 50%">
			<template #header>
				<div style="color: RGB(29,149,243); font-size: 1.5em; font-weight: bold;">PV Info</div>
			</template>
			<table v-if="pvInfo" border="1" width="100%" style="border-collapse:collapse;">
				<tr height="40em">
					<td colspan="1" align="left" style="width: 30%"><span style="font-weight: bold; margin-left: 0.5em;">PV Name</span></td>
					<td colspan="3" align="left"><span style="margin-left: 0.5em; font-weight: bold; color: RGB(29,149,243);">{{ pvInfo.pvName }}</span></td>
				</tr>
				<tr height="40em">
					<td colspan="1" align="left" style="width: 30%"><span style="font-weight: bold; margin-left: 0.5em;">Status</span></td>
					<td colspan="3" align="left"><span style="margin-left: 0.5em;">{{ pvInfo.status }}</span></td>
				</tr>
				<tr height="40em">
					<td colspan="1" align="left" style="width: 30%"><span style="font-weight: bold; margin-left: 0.5em;">Appliance</span></td>
					<td colspan="3" align="left"><span style="margin-left: 0.5em;">{{ pvInfo.appliance }}</span></td>
				</tr>
				<tr height="40em">
					<td colspan="1" align="left" style="width: 30%"><span style="font-weight: bold; margin-left: 0.5em;">Connected</span></td>
					<td colspan="3" align="left"><span style="margin-left: 0.5em;">{{ pvInfo.connectionState }}</span></td>
				</tr>
				<tr height="40em">
					<td colspan="1" align="left" style="width: 30%"><span style="font-weight: bold; margin-left: 0.5em;">Monitored</span></td>
					<td colspan="3" align="left"><span style="margin-left: 0.5em;">{{ pvInfo.isMonitored }}</span></td>
				</tr>
				<tr height="40em">
					<td colspan="1" align="left" style="width: 30%"><span style="font-weight: bold; margin-left: 0.5em;">Sampling period</span></td>
					<td colspan="3" align="left"><span style="margin-left: 0.5em;">{{ pvInfo.samplingPeriod }}</span></td>
				</tr>
				<tr height="40em">
					<td colspan="1" align="left" style="width: 30%"><span style="font-weight: bold; margin-left: 0.5em;">Last event</span></td>
					<td colspan="3" align="left"><span style="margin-left: 0.5em;">{{ pvInfo.lastEvent }}</span></td>
				</tr>
			</table>
			<template #footer>
				<Button label="Close" icon="pi pi-times" text severity="secondary" @click="infoDialogDisplay=false" />
			</template>
		</Dialog>

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
	</div>

</template>

<script>
import Excel from 'exceljs';
import fileDownload from 'js-file-download';
import moment from 'moment';
import ArchiverService from '@/service/ArchiverService';

export default {
	data() {
		return {
			allPVs: null,
			filterPVs: null,
			pvs: null,
			filters: {},
			currentPageFirstIndex: 0,

			pvInfo: null,
			pvDetails: null,

			lazyParams: {},
			totalRecords: 0,
			tableLoading: false,

			infoDialogDisplay: false,
			detailsDialogDisplay: false,
		}
	},
	archiverService: null,
	created() {
		this.archiverService = new ArchiverService();
	},
	mounted() {
		this.resetLazyParams();
		this.loadPVList();
	},
	methods: {
		async loadPVList() {
			this.tableLoading = true;
			try {
				this.allPVs = await this.archiverService.getAllPVs();
				this.loadLazyData();
			} catch(error) {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load PV list', detail: error.response.data });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load PV list', detail: error.message });
				}
			} finally {
				this.tableLoading = false;
			}
		},
		loadLazyData() {
			let first = this.lazyParams.first;
			let rows = this.lazyParams.rows;
			let keyword = this.filters.search;

			if(keyword) {
				this.filterPVs = this.allPVs.filter((name) => (name.includes(keyword)));
			} else {
				this.filterPVs = this.allPVs;
			}

			let pvNames = this.filterPVs.slice(first, first + rows);
			this.totalRecords = this.filterPVs.length;
			
			this.pvs = pvNames.map((name) => {return { name: name }});
		},
		onPage(event) {
            this.lazyParams.first = event.first;
			this.lazyParams.rows = event.rows;
			this.lazyParams.sortField = event.sortField;
			this.lazyParams.sortOrder = event.sortOrder;
            this.loadLazyData();
        },
		resetLazyParams() {
			this.lazyParams = {
				first: 0,
				rows: this.$refs.dt.rows,
				sortField: null,
				sortOrder: null,
				filters: this.filters
			};
		},
		resetSearch() {
			this.filters = {};
            this.loadLazyData();
        },
		search() {
            this.loadLazyData();
		},
		onSearchInput() {
			this.debounce(() => this.search());
		},
		debounce(func, timeout = 500){
			if(this.debounceTimer) {
				clearTimeout(this.debounceTimer);
				this.debounceTimer = setTimeout(() => { 
					func.apply();
					this.debounceTimer = null;
				}, timeout); //tolerance in ms
			} else {
				this.debounceTimer = setTimeout(() => { 
					func.apply();
					this.debounceTimer = null;
				}, timeout); //tolerance in ms
			}
		},
		async onExportClick() {
			let loader = this.$loading.show();

			try {
				let workbook = new Excel.Workbook();
				let worksheet = workbook.addWorksheet('PV List');

				worksheet.columns = [
					{ header: 'PV Name', key: 'name', width: 100 },
				];

				const headerCellArray = ['A1'];
				for(let i = 0; i < headerCellArray.length; i++) {
					worksheet.getCell(headerCellArray[i]).font = {
						color: { argb: 'FFFF0000' },
						bold: true
					};
				}

				for(let i = 0; i < this.filterPVs.length; i++) { 
					let pv = this.filterPVs[i]; 
					worksheet.addRow({ name: pv });
				} 

				let data = await workbook.xlsx.writeBuffer();
				const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
				const filename = 'Archiver_PV_LIST_' + moment().format('YYYYMMDD') + '.xlsx';
				loader.hide();
				fileDownload(blob, filename);
			} catch(error) {
				console.log(error);
				this.$toast.add({ severity: 'error', summary: 'Failed to export PV list', detail: '' });
			} finally {
				loader.hide();
			}
			
		},
		async onInfoClick(pv) {
			this.pvInfo = await this.archiverService.getSinglePVStatus(pv);
			this.infoDialogDisplay = true;
		},
		async onDetailClick(pv) {
			this.pvDetails = await this.archiverService.getPVDetails(pv);
			this.detailsDialogDisplay = true;
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
