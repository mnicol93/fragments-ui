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
    console.log('Got user fragments data', { data });
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