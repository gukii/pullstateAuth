//import { createAsyncAction } from "pullstate";
//const myAsyncAction = createAsyncAction(action, hooksAndOptions);

//
// pullstate async action:
//

import { createAsyncAction, errorResult, successResult } from "pullstate";



const loginAsyncAction = createAsyncAction(
  async ({ username, password }) => {

    try {
      setLoading(true)
      const sess = await authenticateAsync({ username, password })

      window.alert('authenticateAsync res:'+ JSON.stringify(sess) )

      if (!!sess) { // is called something else..
        return successResult(sess);
      }
    }
    catch (e) {
      // return errorResult will set ```error: true``` in result obj !!
      return errorResult( [], `Couldn't get pictures: ${result.errorMessage}` );
      return errorResult( [e.code], "No user found in database by that name" );
    }


    return errorResult([], `Couldn't get pictures: ${result.errorMessage}`);
  },
  {
    postActionHook: ({ result, stores }) => {
      if (!result.error) {
        stores.GalleryStore.update(s => {
          s.pictures = result.payload.pictures;
        });
      }
    },
  }
);



export const PictureExample = props => {
  // const [started, finished, result, updating] = searchPicturesForTag.useWatch({ tag }, options);
  const [finished, result, updating] = loginAsyncAction.useBeckon({ username: props.username, password: props.password });

  if (updating) {
    setLoading(true)
    return <div>Updating</div>;
  }

  if (!finished) {
    setLoading(false)

    history.push(R.PRIVATE_HOME_ROUTE)
    return doSuccess(sess, "signInFormAsync, signIn ok")

    return <div>Loading Pictures for tag "{props.tag}"</div>;
  }

  if (result.error) {
    return <div>{result.message}</div>;
  }

  return <Gallery pictures={result.payload.pictures} />;
};
