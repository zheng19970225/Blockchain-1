export const dva = {
  config: {
    onError(err: ErrorEvent) {
      err.preventDefault();
      // tslint:disable:no-console
      console.error(err.message);
    },
  },
};
