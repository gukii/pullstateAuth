export async function ipLookUp () {

  try {

    // other service: https://extreme-ip-lookup.com/json/

    const endpoint = 'http://ip-api.com/json'

    // has "mobile" field
    //const endpoint = 'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,query'
    console.log('doing ipLookUp with endpoint:', endpoint)

    const res = await fetch(endpoint)
    console.log('res:', res)

    const json = await res.json()

    console.log('ipLookUp response json:', json)
    console.log('ipLookUpUser\'s Country:', json.country);


    return json
  }
  catch(err) {
    console.log('ipLookUp error:', err)
    return null
  }
}




// to find user that is the furthest away:

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1);
	var a =
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI/180)
}


/*
export async function ipLookUp( endpoint = 'http://ip-api.com/json/',
                                fields = 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,query',
                                cb = null) {

  try {
    if (!!!endpoint || !!!endpoint.length || endpoint.length === 0) {
      console.log('ipLookUp got no endpoint..')
      return null
    }
    const url =  !!fields && fields.length > 0 ? endpoint+'?fields='+fields : endpoint
    console.log('ipLookUp url:', url)
    const res = await fetch(url)
    console.log('res:', res)

    const json = await res.json()

    console.log('ipLookUp response json:', json)
    console.log('ipLookUp user\'s country', json.country);

    if (cb !== null) cb(json)
    return json
  }
  catch(err) {
    console.log('ipLookUp error:', err)
    return null
  }
}




// to find user that is the furthest away:

export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1);
	var a =
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI/180)
}

*/
