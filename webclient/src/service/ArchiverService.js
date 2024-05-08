import axios from 'axios';
import qs from 'qs';
import config from '@/config/configuration.js';

export default class ArchiverService {

	async getApplianceInfo() {
		let url = `${config.proxyPath}/mgmt/bpl/getApplianceInfo`;
		let res = await axios.get(url);
		return res.data;
	}

	async getClusterInfo() {
		let url = `${config.proxyPath}/mgmt/bpl/getInstanceMetrics`;
		let res = await axios.get(url);
		return res.data;
	}

	async getAllPVs() {
		let url = `${config.proxyPath}/mgmt/bpl/getAllPVs?limit=-1`;
		let res = await axios.get(url);
		return res.data;
	}

	async getSinglePVStatus(pv) {
		if(!pv) return null;
		let url = `${config.proxyPath}/mgmt/bpl/getPVStatus?pv=${pv}`;
		let res = await axios.get(url);
		return res.data[0];
	}

	async getMultiplePVStatus(pvs) {
		if(!pvs || !pvs.length) return null;
		let url = `${config.proxyPath}/mgmt/bpl/getPVStatus`;
		let res = await axios.post(url, qs.stringify({ pv: pvs.join() }));
		return res.data;
	}

	async getAllPVStatus() {
		let url = `${config.proxyPath}/mgmt/bpl/getPVStatus`;
		let res = await axios.post(url);
		return res.data;
	}

	async getPVDetails(pv) {
		if(!pv) return null;
		let url = `${config.proxyPath}/mgmt/bpl/getPVDetails?pv=${pv}`;
		let res = await axios.get(url);
		return res.data;
	}

	async getInstanceIdentities() {
		let url = `${config.proxyPath}/mgmt/bpl/getInstanceMetrics`;
		let identities = [];
		let res = await axios.get(url);
		let instances = res.data;
		for(let instance of instances) {
			identities.push(instance.instance);
		}
		return identities;
	}

	async archiveMultiplePV(pvs, samplingMode, samplingPeriod, controllingPV, appliance) {
		if(!pvs || !pvs.length || !samplingMode || !samplingPeriod) return null;
		let url = `${config.proxyPath}/mgmt/bpl/archivePV`;
		let param = {
			pv: pvs.join(),
			samplingmethod: samplingMode,
			samplingperiod: samplingPeriod,
		};
		if(controllingPV) param.controllingPV = controllingPV;
		if(appliance) param.appliance = appliance;
		let res = await axios.post(url, qs.stringify(param));
		return res.data;
	}

	async pausePV(pv) {
		if(!pv) return null;
		let url = `${config.proxyPath}/mgmt/bpl/pauseArchivingPV?pv=${pv}`;
		let res = await axios.get(url);
		return res.data;
	}

	async resumePV(pv) {
		if(!pv) return null;
		let url = `${config.proxyPath}/mgmt/bpl/resumeArchivingPV?pv=${pv}`;
		let res = await axios.get(url);
		return res.data;
	}

	async deletePV(pv) {
		if(!pv) return null;
		let url = `${config.proxyPath}/mgmt/bpl/deletePV?pv=${pv}&deleteData=false`;
		let res = await axios.get(url);
		return res.data;
	}

	async abortPV(pv) {
		if(!pv) return null;
		let url = `${config.proxyPath}/mgmt/bpl/abortArchivingPV?pv=${pv}`;
		let res = await axios.get(url);
		return res.data;
	}

	async renamePV(pv, newname) {
		if(!pv || !newname) return null;
		let url = `${config.proxyPath}/mgmt/bpl/renamePV?pv=${pv}&newname=${newname}`;
		let res = await axios.get(url);
		return res.data;
	}
}