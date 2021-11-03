import { BeaconWallet } from "@taquito/beacon-wallet";
import { Tezos } from "@taquito/taquito";

const axios = require("axios");
const faucetAddress = "tz1aaFbFMUhQ7LWXd3o8hQoAGzMuge7HP5n8";
let userAddress, userBalance, wallet;
const serverEndpoint =
	"http://127.0.0.1:3000/getmoney/tz1MAYxo7VL5kFNuun1TKYBzDMsgPtF7PMcE";

window.onload = () => {
	document.getElementById("init-wallet").onclick = initWallet;
	document.getElementById("redeem-faucet").onclick = redeemFaucet;
	document.getElementById("disconnect").onclick = disconnectWallet;
};

const updateInnerText = (id, text) =>
	(document.getElementById(id).innerText = text);

const redeemFaucet = async () => {
	console.log("sending endpoint");
	axios.get(serverEndpoint).then((resp) => {
		console.log(resp.data);
	});
};

const initWallet = async () => {
	try {
		const options = {
			name: "Taquito Wallet",
		};
		wallet = new BeaconWallet(options);
		const network = {
			type: "granadanet",
			rpcUrl: "https://rpc.granada.tzstats.com",
		};

		await wallet.requestPermissions({ network });
		Tezos.setWalletProvider(wallet);
		//update dapp interface
		console.log("Your address:", wallet.permissions.address);
		userAddress = wallet.permissions.address;
		console.log("Your address:", userAddress);
		userBalance = await Tezos.tz.getBalance(userAddress);

		//hides button
		document.getElementById("connection").style.display = "none";

		//shows and populates interace
		document.getElementById("interface").style.display = "block";
		updateInnerText("user-address", userAddress);
		updateInnerText("user-balance", userBalance / 1000000);
	} catch (error) {
		console.log(error);
	}
};

const disconnectWallet = async () => {
	try {
		console.log("disconnecting");
		wallet.client.destroy();
		wallet = undefined;
	} catch (error) {
		console.log(error);
	}
};
