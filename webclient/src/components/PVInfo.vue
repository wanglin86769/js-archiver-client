<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					PV Info
				</div>

				<Toolbar class="mb-0">
					<template v-slot:start>
						
					</template>

					<template v-slot:end>
						<div class="p-inputgroup">
							<Button label="Reset" icon="pi pi-refresh" class="p-button-success p-button-sm" @click="resetSearch"/>
							<InputText placeholder="Keyword" style="width: 30em" class="p-inputtext-sm" v-model="filters.search" @input="onSearchInput" />
						</div>
					</template>
				</Toolbar>

				<DataTable :value="pvInfos" dataKey="_id" :paginator="true" :rows="25" :rowHover="true" showGridlines 
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[10,25,50,100,200]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pvs" 
							paginatorPosition="both" responsiveLayout="stack" v-model:first="currentPageFirstIndex"
							ref="dt" :lazy="true" :totalRecords="totalRecords" :loading="tableLoading" @page="onPage($event)">
					
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
							<i class="pi pi-search-plus" v-tooltip.top="'Detail'" style="font-size: 1.2rem; cursor: pointer; color: RGB(29,149,243); margin-left: 1.0em" @click="onDetailClick(slotProps.data.pvName)"></i>
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
	</div>

</template>

<script>
import ArchiverService from '@/service/ArchiverService';

export default {
	data() {
		return {
			allPVs: null,
			filterPVs: null,
			pvInfos: null,
			filters: {},
			currentPageFirstIndex: 0,

			pvDetails: null,

			lazyParams: {},
			totalRecords: 0,
			tableLoading: false,

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
		async loadLazyData() {
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
			
			this.pvInfos = await this.archiverService.getMultiplePVStatus(pvNames);
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
