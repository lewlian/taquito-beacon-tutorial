import "babel-polyfill";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { Tezos } from "@taquito/taquito";

let userAddress, userBalance, faucetBalance;

const faucetAddress = "tz1aaFbFMUhQ7LWXd3o8hQoAGzMuge7HP5n8";

window.onload = () => {
	document.getElementById("init-wallet").onclick = initWallet;
	document.getElementById("redeem-faucet").onclick = changeMessage;
	document.getElementById("disconnect").onclick = disconnect;
};

const updateInnerText = (id, text) =>
	(document.getElementById(id).innerText = text);

const showToast = (msg) => {
	const toast = document.getElementById("toast");
	toast.textContent = msg;
	setTimeout(() => {
		toast.className = "show";
		setTimeout(() => {
			toast.className = toast.className.replace("show", "");
		}, 3000);
	}, 3000);
};

const initWallet = async () => {
	try {
		Tezos.setProvider({ rpc: `https://granadanet.api.tez.ie` });
		// creating new Beacon wallet instance
		const options = {
			name: "Taquito Beacon Tutorial",
			eventHandlers: {
				PERMISSION_REQUEST_SUCCESS: {
					handler: async (data) => {
						console.log("Wallet is connected:", data);
					},
				},
				OPERATION_REQUEST_SENT: {
					handler: async (data) => {
						console.log("Request sent:", data);
					},
				},
				OPERATION_REQUEST_SUCCESS: {
					handler: async (data) => {
						console.log("Request successful:", data);
						showToast("Request successful!");
					},
				},
				OPERATION_REQUEST_ERROR: {
					handler: async (data) => {
						console.log("Request error:", data);
						showToast("Request error!");
					},
				},
			},
		};
		const wallet = new BeaconWallet(options);
		// setting up network
		const network = {
			type: "granadanet",
		};
		// requesting permissions on selected network
		await wallet.requestPermissions({ network });
		// setting Beacon wallet as wallet provider for Taquito
		Tezos.setWalletProvider(wallet);
		// getting user's address
		userAddress = wallet.permissions.address;
		console.log("Your address:", userAddress);
		// getting user's balance on Carthagenet
		userBalance = await Tezos.tz.getBalance(userAddress);
		faucetBalance = await Tezos.tz.getBalance(faucetAddress);
		// getting info from smart contract

		// hides button
		document.getElementById("connection").style.display = "none";
		// shows and populates contract interface
		document.getElementById("interface").style.display = "block";
		updateInnerText("user-address", userAddress);
		updateInnerText("user-balance", userBalance / 1000000);
		updateInnerText("faucet-balance", faucetBalance / 1000000);
	} catch (error) {
		console.log(error);
	}
};

const disconnect = () => {
	wallet.client.destroy();
	wallet = undefined;
};

const changeMessage = async () => {
	// disables confirmation button
	document.getElementById("redeem-faucet").disabled = true;
	// displays loader
	document.getElementById("loader").style.display = "block";
	const message = document.getElementById("new-message").value;
	try {
		const op = await contractInstance.methods.changeMessage(message).send();
		await op.confirmation();
		document.getElementById("new-message").value = "";
		// reloads storage
	} catch (error) {
		console.log(error);
	} finally {
		document.getElementById("redeem-faucet").disabled = false;
		document.getElementById("loader").style.display = "none";
	}
};
