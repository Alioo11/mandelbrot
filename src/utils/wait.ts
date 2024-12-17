const wait = (timeoutInMs: number) => new Promise((res) => setTimeout(res, timeoutInMs));

export default wait;
