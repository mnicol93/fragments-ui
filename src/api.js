// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user, expand=0) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=${expand}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    return { data };

  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    return null;
  }
}
export async function postFragment(user, value, contentType){
  try{
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers:{
        Authorization: `Bearer ${user.idToken}`,
        'Content-Type': contentType
      },
      body: value
    });
    console.log(res);
    if(!res.ok){
      const error = await res.json();
      throw error.error?.message || res.statusText;
    }
    const data = await res.json();
    console.log('Posted fragments data', { data });
    return data;
  }catch(err){
    console.error('Unable to call POST ', { err });
    throw new Error(err);
  }
}
export async function getFragmentById(user, id, expand=''){
  console.log('Requesting Fragment: ' + id);

  try{
    const res = await fetch(`${apiUrl}/v1/fragments/${id}${expand}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const contentType = res.headers.get('content-type');

    if(contentType.startsWith('text')){
      return { contentType, data: await res.text() };
    }else if(contentType.startsWith('image')){
      return { contentType, data: await res.blob() };
    }else if( contentType.startsWith('application')){
      return { contentType, data: await res.json() };
    }else{
      throw new Error(`Unkown Media Type provided, check Fragment ${id}`);
    }
  }catch(err){
    throw new Error('Error getting Fragment by ID', {err});
  }
}
export async function getFragmentByIdInfo(user, id){
  try{
    const res = await fetch(`${apiUrl}/v1/fragments/${id}/info`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  }catch(err){
    throw new Error('Error getting Fragment by ID', {err});
  }
}