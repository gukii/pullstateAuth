import React, { useEffect, useState } from 'react'
import { TestStore } from './auth/psStore/TestStore'


export const StoreTest = () => {

    const [iterator, setIterator] = useState('a2')

    const objs = TestStore.useState( s=>s.objs )


    // works
    useEffect( ()=> {

        TestStore.update(s => {
            s.objs['a1'] = { name:'Obj1' }            
            s.objs['a2'] = { name:'Obj2' }
            s.objs['a5'] = { name:'Obj5' }
        }) 
        
        setIterator('a5')

    }, [setIterator])


    // works
    useEffect(() => {
      
        const unsubscribeFromObj5 = TestStore.subscribe(
          s => s.objs['a5'],
          newObj => {
            console.log('newObj:', newObj)
          }
        );
        
        return () => {
            unsubscribeFromObj5();
        };
      }, []);
    
    

    const obj5 = TestStore.useState( s=>s.objs[iterator], iterator ) // works
    //const obj5 = TestStore.useState( s=>s.objs['a5'] ) // works

    // this works, if the store is initialized with a field objs['a5']
    //const obj5 = !!TestStore && !!TestStore.currentState && !!TestStore.currentState.objs && !!TestStore.currentState.objs['a5'] ? JSON.stringify(TestStore.currentState.objs['a5']) : 'no val'
    //const obj5 = !!TestStore && !!TestStore.currentState && !!TestStore.currentState.objs && !!TestStore.currentState.objs['a5'] ? TestStore.currentState.objs['a5'] : 'no val'

    console.log('TestStore:', TestStore)

    const renderedObjs = Object.keys(objs).map( (key, idx) => <div key={key}>{key}:{objs[key].name}</div> )


    return(
        <>
            Store: <br />

            { renderedObjs }
            <br />

            Obj5:{ !!obj5 && obj5.name ? obj5.name : 'obj5 has no name' }
            <br />

            <button onClick={ ()=> TestStore.update(s => { s.objs['a5'] = { name: 'ObjUp5'}} )}>
                Update Obj5
            </button>
        </>
    )
}

