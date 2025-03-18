async function hitEmailServerApi(apiUrl, typeOfEmail, emailAddress, data) {
  try {
    const serverResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: typeOfEmail,
        email: emailAddress,
        data: data,
      }),
    });
    const emailData = await serverResponse.json();
    return { emailResponse: emailData, error: null };
  } catch (error) {
    return { emailResponse: null, error: error };
  }
}
module.exports = {
  hitEmailServerApi,
};
