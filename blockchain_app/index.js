// 1.Import lisk sdk to create the blockchain application
const {
	Application,
	configDevnet,
	genesisBlockDevnet,
	HTTPAPIPlugin,
	utils,
} = require('lisk-sdk');

// 2.Import NFT module and Plugin
const { NFTModule } = require('./nft_module');
const { NFTAPIPlugin } = require('./nft_api_plugin');
const { DashboardPlugin } = require("@liskhq/lisk-framework-dashboard-plugin");


// 3.Update the genesis block accounts to include NFT module attributes
genesisBlockDevnet.header.timestamp = 1605699440;
genesisBlockDevnet.header.asset.accounts = genesisBlockDevnet.header.asset.accounts.map(
	(a) =>
		utils.objects.mergeDeep({}, a, {
			nft: {
				ownNFTs: [],
			},
		}),
);

// 4.Update application config to include unique label
// and communityIdentifier to mitigate transaction replay
const appConfig = utils.objects.mergeDeep({}, configDevnet, {
	label: 'nft-app',
	genesisConfig: { communityIdentifier: 'NFT' }, //In order to have a unique networkIdentifier
	logger: {
		consoleLogLevel: 'info',
	},
	plugins: {
    		httpApi: { 
        		port: 4000, 
			host: '0.0.0.0',
        		whiteList: [],
        		cors: { 
            			origin: '*', 
            			methods: ['GET', 'POST', 'PUT'], 
        		},
        		limits: { 
            			max: 0, 
            			delayMs: 0, 
            			delayAfter: 0, 
            			windowMs: 60000, 
            			headersTimeout: 5000, 
            			serverSetTimeout: 20000, 
        		},
    		},
  	},
});

// 5.Initialize the application with genesis block and application config
const app = Application.defaultApplication(genesisBlockDevnet, appConfig);

// 6.Register custom NFT Module and Plugins
app.registerModule(NFTModule);
app.registerPlugin(HTTPAPIPlugin);
app.registerPlugin(NFTAPIPlugin);
app.registerPlugin(DashboardPlugin);


// 7.Run the application
app
	.run()
	.then(() => console.info('NFT Blockchain running....'))
	.catch(console.error);

