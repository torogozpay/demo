import React, { useEffect, useState } from 'react';
import { Screen, Spinner, View, Text, Title } from '@shoutem/ui';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { connectStyle } from '@shoutem/theme';
import { checkoutCompleted } from '../../redux/actionCreators';
import { ext } from '../../const';
import autoBindReact from 'auto-bind/react';
import { I18n } from 'shoutem.i18n';
import DeviceInfo from 'react-native-device-info';
import {
    closeModal,
    getRouteParams,
    goBack,
    HeaderCloseButton,
    HeaderTextButton,
  } from 'shoutem.navigation';
  import QRCode from 'react-native-qrcode-svg';
import {Clipboard} from 'react-native';
// import {shopifyApi, LATEST_API_VERSION} from '@shopify/shopify-api';


const BitcoinCheckoutScreen = ({ navigation, route }) => {

    const dataPurchase = route.params.data;
    const [totalPurchase, setTotalPurchase] = useState(0.0);
    const [totalPurchaseSatoshis, setTotalPurchaseSatoshis] = useState(0.0);
    const [invoice, setInvoice] = useState(null);
    const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

    
    useEffect(() => {
        const initializeState = async () => {
            let totalPurchase = Number(0.0);
            for (let index = 0; index < dataPurchase.cart.length; index++) {
                const element = dataPurchase.cart[index];
                totalPurchase += element.price;
            }

            const totalPurchaseFormatted = Number(totalPurchase).toFixed(2);

            console.log(invoice);

            if(invoice === null) {
                console.log('invoice is null');
                const invoiceCreated = await createInvoice(totalPurchaseFormatted);
                // setInvoice(invoiceCreated);
                //const invoiceCreated = await getInvoice();
                setInvoice(invoiceCreated);                
            } 

            // Session is built by the OAuth process

            await shopify.rest.Order.all({
                session: session,
                status: "any",
            });

            
            setTotalPurchase(totalPurchaseFormatted);
        };

        initializeState();

       
    }, []);

    useEffect(() => {

      const getStatusInvoice = async () => {
        const invoice = await getInvoice();
        console.log('getStatusInvoice');

        if(invoice !== null) {
          setIsPaymentCompleted(invoice.is_confirmed);
        }
      };
      
      getStatusInvoice();

      const pollingInterval = setInterval(getStatusInvoice, 10000);

      // Limpia el intervalo cuando el componente se desmonta
      return () => {
        clearInterval(pollingInterval);
      };

    }, [invoice]);

    const usdToSatoshi = async (amountUSD) => {
      try {
        // Realiza una solicitud a la API de CoinDesk para obtener el precio actual de Bitcoin en USD.
        const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice/BTC.json', {
          method: 'GET',        
          headers: {
              'Content-Type': 'application/json',
          }
        });

        // Convierte la respuesta a JSON
        const json = await response.json();

        const bitcoinPriceUSD = parseFloat(json.bpi.USD.rate.replace(/,/g, ''));  // Extrae el precio de Bitcoin en USD
    
        // Calcula la cantidad en Satoshi
        const satoshi = Math.round(amountUSD / bitcoinPriceUSD * 100000000);
    
        return satoshi;
      } catch (error) {
        console.error('Error al obtener la tasa de conversión:', error);
        return null;
      }
    }

    const createInvoice = async (totalPurchaseFormatted) => {
        const paymentInSatsFromUsd = await usdToSatoshi(totalPurchaseFormatted); // needs await since calling CoinDesk API
        console.log(paymentInSatsFromUsd);
        setTotalPurchaseSatoshis(paymentInSatsFromUsd);

        const response = await fetch('https://lnd.sm-devlab.com/v0/lnd/createinvoice', {
            method: 'POST',
            body: JSON.stringify({
                "tokens": paymentInSatsFromUsd,
                "description": "Purchase from TorogozPay",
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const json = await response.json();

        return json;
    }

    const getInvoice = async () => {
        const id = invoice?.id;

        if(id !== null) {
          const response = await fetch(`https://lnd.sm-devlab.com/v0/lnd/getinvoice/${id}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          const json = await response.json();
          return json;
        }
    }


    return (
        <Screen>
            <View styleName="vertical v-center h-center fill-parent">
                <Title>Payment with LN-BTC</Title>
                <Title>Total: {totalPurchase} USD</Title>                
                <Title>{totalPurchaseSatoshis} Satoshi</Title>
                {isPaymentCompleted ?
                  <Text  style={{fontSize: 15, color: 'green'}}   >Payment successful</Text>
                  : <Text selectable={true} style={{fontSize: 15}} onPress={() => Clipboard.setString(invoice?.request)}>{invoice?.request}</Text>                  
                }
                <Text>{dataPurchase.description}</Text>
                <QRCode
                    value={invoice?.request}
                    size={200}
                    color={isPaymentCompleted ? 'green' : 'black'}
                    backgroundColor="white"
                />
            </View>
        </Screen>
    );
}

export default BitcoinCheckoutScreen;

/*class BitcoinCheckoutScreen extends PureComponent {
    constructor(props) {
      super(props);

      const {data} = this.props.route.params;
      console.log('data');    
      console.log(data);  

      console.log('BitcoinCheckoutScreen constructor');     
      autoBindReact(this);

      this.state = {
        shouldStopLoading: false,
        transactionCompleted: false,
        userAgent: null,
        data: data,
      };

 
    }




    
  componentDidMount() {

    const { navigation } = this.props;
    navigation.setOptions(this.getNavBarProps());
       

    DeviceInfo.getUserAgent()
      .then(userAgent => {
        this.setState({ userAgent });
      })
      .catch(error => {
        // no other action taken, as `null` user agent will result with default behavior which is
        // not an issue
        console.error('Failed to get user agent from device info.\n', error);
      });

      async function initializeState() {
        let totalPurchase = Number(0.0);

        console.log('this.state.data.cart INITIALIZE');
        console.log(this.state);
   

        for (let index = 0; index < this.state.data.cart.length; index++) {
            const element = this.state.data.cart[index];
            totalPurchase += element.price;        
        }

        const invoice = await this.createInvoice();

        this.setState({
            ...this.state,               
            totalPurchase: Number(totalPurchase).toFixed(2),
            description: 'Purchase from TorogozPay',
            invoice: invoice,
        });
    }

    async function initialize() {
        await initializeState();
        
    }

    initialize();
  }

  componentDidUpdate() {
    const { navigation } = this.props;

    navigation.setOptions(this.getNavBarProps());


  }


  getNavBarProps() {
    const { transactionCompleted } = this.state;

    return {
      headerLeft: transactionCompleted
        ? () => null
        : props => this.renderCloseButton(props),
      headerRight: !transactionCompleted
        ? () => null
        : props => this.renderDoneButton(props),

      title: I18n.t(ext('checkoutNavBarTitle')),
    };
  }

  renderCloseButton(props) {
    return <HeaderCloseButton onPress={closeModal} {...props} />;
  }

  completeTransaction() {
    const { checkoutCompleted } = this.props;

    // checkoutCompleted();
    // closeModal();
    // goBack();
  }


  renderDoneButton(props) {
    return (
      <HeaderTextButton
        title={I18n.t(ext('doneButton'))}
        onPress={this.completeTransaction}
        {...props}
      />
    );
  }

    
  render() {
    console.log('BitcoinCheckoutScreen render');
    console.log('this.getWebViewProps()');
    // console.log(this.getWebViewProps());
    return (
      <Screen >
        <View styleName="vertical v-center h-center fill-parent">
          <Text>Total: {this.state?.totalPurchase}</Text>
          <Text>{this.state?.description}</Text>
        </View>
      </Screen>
    );
  }

   
}

BitcoinCheckoutScreen.propTypes = {    
    props: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
  };

export default connect(null, {  })(
    connectStyle(ext('BitcoinCheckoutScreen'))(BitcoinCheckoutScreen),
  );*/
  