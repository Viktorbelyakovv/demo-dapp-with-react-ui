import React, {useCallback, useState} from 'react';
import ReactJson, {InteractionProps} from 'react-json-view';
import './style.scss';
import {SendTransactionRequest, useTonConnectUI, useTonWallet} from '@tonconnect/ui-react'
import {  Address, beginCell, toNano} from '@ton/ton'
import axios from "axios";
import moment from "moment";

const Wallet_DST  = Address.parse('UQDkHOK24_d3Unf01VhMQ5C3BYGIYeQzJ2YAUB7ur4SdzRMc');

const Wallet_SRC = Address.parse('UQAnMUM6C-d-QqK4N6juWpHp_J25jVDgCj9m1JPRuq0o6Y7Z');

const jettonWalletContract = 'EQAYOjtwVXNPYc-y7SY7kxkX9pxGft-WqtTcuCkFmiYL8pve';

const body = beginCell()
    .storeUint(0xf8a7ea5, 32)                 // jetton transfer op code
    .storeUint(0, 64)                         // query_id:uint64
    .storeCoins(100)                      // amount:(VarUInteger 16) -  Jetton amount for transfer (decimals = 6 - jUSDT, 9 - default)
    .storeAddress(Wallet_DST)                 // destination:MsgAddress
    .storeAddress(Wallet_SRC)                 // response_destination:MsgAddress
    .storeUint(0, 1)                          // custom_payload:(Maybe ^Cell)
    .storeCoins(toNano(0.05))                 // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
    .storeUint(0,1)                           // forward_payload:(Either Cell ^Cell)
    .endCell();

const myTransaction: SendTransactionRequest = {
  validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
  messages: [
    {
      address: jettonWalletContract,
      amount: '100000',
      payload: body.toBoc().toString("base64") // payload with jetton transfer body
    }
  ],
}

export const TxForm = () => {
  const [transaction, setTransaction] = useState(myTransaction);

  const wallet = useTonWallet();

  const [tonConnectUI] = useTonConnectUI()

  const onChange = useCallback((value: InteractionProps) => {
    setTransaction(value.updated_src as SendTransactionRequest)
  }, []);

  const sendToDataBase = () => {
    axios.post("http://localhost:8000/save-operation", {
      sourceWallet: Wallet_SRC.toString(),
      destinationWallet: Wallet_DST.toString(),
      transferDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    })
        .then((response) => {
          console.log(response);
        });
  }

  return (
      <div className="send-tx-form">
        <h3>Configure and send transaction</h3>

          <ReactJson theme="ocean" src={myTransaction} onEdit={onChange} onAdd={onChange} onDelete={onChange}/>

        {wallet ? (
            <button onClick={() => tonConnectUI.sendTransaction(transaction)}>
              Send transaction
            </button>
        ) : (
            <button onClick={() => tonConnectUI.openModal()}>
              Connect wallet to send the transaction
            </button>
        )}

        <button onClick={sendToDataBase}>Сохранить в БД</button>
      </div>
  )
}
