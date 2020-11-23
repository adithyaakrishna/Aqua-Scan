import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import firestore from '@react-native-firebase/firestore'
import AudioPlayer from 'react-native-play-audio';
import invalid_qr from './assets/audios/invalid_qr.mp3'

export default function App() {

  const onSuccess = async (e) => {
    if (e.type === "QR_CODE") {
      await firestore().collection("cards").doc(e.data).get().then(async (data) => {
        if (data.exists) {
          if (data.data().amount > 0) {
            await firestore().collection("dispensers").doc("device1").update({
              isActive: true
            }).then(() => {
              AudioPlayer.prepare("https://raw.githubusercontent.com/cchirag/modscan/master/collect_water.mp3", () => {
                AudioPlayer.play()
              })
            }).then(async () => {
              let tempMoneySaved = parseFloat((data.data().moneySaved + 0.45).toFixed(2))
              await firestore().collection("cards").doc(e.data).update({
                amount: data.data().amount - 1,
                bottlesSaved: data.data().bottlesSaved + 1,
                moneyDonated: data.data().moneyDonated + 0.5,
                moneySaved: tempMoneySaved,
                waterConsumed: data.data().waterConsumed + 1
              })
            })
          }else{
            AudioPlayer.prepare("https://raw.githubusercontent.com/cchirag/modscan/master/insufficient_balance.mp3", () => {
              AudioPlayer.play()
            })
          }
        } else {
          AudioPlayer.prepare("https://raw.githubusercontent.com/cchirag/modscan/master/invalid_qr.mp3", () => {
            AudioPlayer.play()
          })
        }
      })
    }
  };
  return (
    <View>
      <QRCodeScanner
        reactivate={true}
        reactivateTimeout={3000}
        onRead={onSuccess}
        flashMode={
          RNCamera.Constants.FlashMode.off
        }
        topContent={
          <Text style={styles.centerText}>
            <Text style={styles.textBold}>Scan the QR</Text>
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  }
});