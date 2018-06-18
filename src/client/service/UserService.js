export function getSignedInUser(username, address, signature) {
    //const userData = loadUserData();
    //const profile = new Person(loadUserData().profile);
    return {
        address: address,
        name: username || address,
        username: username || address,
        signature: signature,
        avatar: ''
    };
}