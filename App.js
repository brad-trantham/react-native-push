import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
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
        return
      }
    })
  }, [])

  useEffect(() => {
    // this allows you define a function to respond to a notification
    // when the app is in the background
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
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
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'My first local notification',
        body: 'This is the first local notification we are sending!',
        data: {mySpecialData: 'Some text'}
      },
      trigger: {
        seconds: 10
      }
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
