import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, View } from 'react-native';
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'

// this defines what should happen if the app's notification pops up while
// the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true
    }
  }
})

export default function App() {
  const [pushToken, setPushToken] = useState()
  // permission only needed in ios, ignored in android
  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS)
    .then(statusObj => {
      if (statusObj.status !== 'granted') {
        return Permissions.askAsync(Permissions.NOTIFICATIONS)
      }
      return statusObj
    }).then(statusObj => {
      if(statusObj.status !== 'granted') {
        throw new Error('Permission not granted')
      }
    }).then(() => {
      console.log('getting token')
      return Notifications.getExpoPushTokenAsync()
    }).then(response => {
      const token = response.data
      setPushToken(token)
      // this is where you'd normally call your own backend api and store
      // the token in the DB
      // the push token can be permanently stored as part of your user data
    }).catch(err => {
      console.log(err)
      return null
    })
  }, [])

  useEffect(() => {
    // this allows you define a function to respond to a notification
    // when the app is in the background
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(
      response => {
      console.log(response)
    })

    // this allows you define a function to respond to a notification
    // when the app is in the foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      notification =>  {
      console.log(notification)
    })

    // cleanup function
    return () => {
      backgroundSubscription.remove()
      foregroundSubscription.remove()
    }
  }, [])

  const triggerNotificationHandler = () => {
    // Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: 'My first local notification',
    //     body: 'This is the first local notification we are sending!',
    //     data: {mySpecialData: 'Some text'}
    //   },
    //   trigger: {
    //     seconds: 10
    //   }
    // })

    // expo provides SDKs in various back end languages
    // to generate push notifications from back end code
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding' : 'gzip, deflate',
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        to: pushToken,
        data: {extraData: 'some data'},
        title: 'Sent via the app',
        body: 'This push notification was sent via the app'
      })
    })
  }

  return (
    <View style={styles.container}>
      <Button title="Trigger notification" 
              onPress={triggerNotificationHandler}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
