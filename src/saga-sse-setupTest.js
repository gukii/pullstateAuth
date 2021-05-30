import { take, put, call, apply, delay } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { createWebSocketConnection } from './socketConnection'

// just used for testing... not part of functional product

// https://redux-saga.js.org/docs/advanced/Channels.html

// this function creates an event channel from a given socket
// Setup subscription to incoming `ping` events

function createSseChannel(sseSource) {
  // `eventChannel` takes a subscriber function
  // the subscriber function takes an `emit` argument to put messages onto the channel
  return eventChannel(emit => {


    const bidUpdateHandler = event => {
      // puts event payload into the channel
      // this allows a Saga to take this payload from the returned channel
      emit(event.payload)
    }

    const errorHandler = (errorEvent) => {
      // create an Error object and put it into the channel
      emit(new Error(errorEvent.reason))
    }


    // setup the subscription


    // addEventListener version
    sseSource.addEventListener('open', e => {
        console.log("The connection has been established.");
    })

    // onopen version
    sseSource.onopen = e => {
        console.log("The connection has been established.");
    }


    sseSource.addEventListener("bidUpdate", bidUpdateHandler)
    // for messages with an event field


    sseSource.onmessage = function(event) {
        // for messages without event field
        console.log('message without event field:', event.data)
    }


    // sseSource.onopen vs sseSource.onconnect: looks like some browsers support the one or the other..

    sseSource.onconnect      = function(event) {
        // for messages without event field
        console.log('message without event field:', event.data)
    }

    sseSource.onerror = function(err) {
        console.log('sse error:', err)
    }

    //socket.on('ping', pingHandler)
    //socket.on('error', errorHandler)

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
        sseSource.removeEventListener("ping", function(event) {
            const newElement = document.createElement("li");
            const time = JSON.parse(event.data).time;
            // etc
        });

        sseSource.close();

    }

    return unsubscribe
  })
}

/*
// reply with a `pong` message by invoking `socket.emit('pong')`
function* pong(socket) {
  yield delay(5000)
  yield apply(socket, socket.emit, ['pong']) // call `emit` as a method with `socket` as context
}

export function* watchOnPings() {
  const socket = yield call(createWebSocketConnection)
  const socketChannel = yield call(createSocketChannel, socket)

  while (true) {
    try {
      // An error from socketChannel will cause the saga jump to the catch block
      const payload = yield take(socketChannel)
      yield put({ type: INCOMING_PONG_PAYLOAD, payload })
      yield fork(pong, socket)
    } catch(err) {
      console.error('socket error:', err)
      // socketChannel is still open in catch block
      // if we want end the socketChannel, we need close it explicitly
      // socketChannel.close()
    }
  }
}
*/
