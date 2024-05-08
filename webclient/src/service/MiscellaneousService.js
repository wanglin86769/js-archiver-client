import axios from 'axios';
import config from '@/config/configuration.js';

export default class MiscellaneousService {

    async archiverURL() {
        try {
            let url = `${config.proxyPath}/archiverinfo`;
            let res = await axios.get(url);
            return res.data.url;
        } catch(error) {
            return null;
        }
	}

    async proxyConnection() {
        let result;
        try {
            let url = `${config.proxyPath}/ping`;
            let res = await axios.get(url);
            result = (res || res.data || res.data.result === "Success") ? true : false;
        } catch(error) {
            result = false;
        }
        return result;
	}

	async archiverConnection() {
        let result;
        try {
            let url = `${config.proxyPath}/mgmt/bpl/getApplianceInfo`;
            let res = await axios.get(url);
            result = (res || res.data || res.data.identity) ? true : false;
        } catch(error) {
            result = false;
        }
        return result;
	}
}