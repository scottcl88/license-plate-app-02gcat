/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2023 Scott Lewis, All rights reserved.
 */
 class ClientBase {
  /**
   * authorization token value
   */
  public token: string | undefined;

  // constructor(private authService: AuthService) {
  //   this.token = '';
  // } // @ts-ignore
  protected transformResult(url: string, response: any, processor: (response: any) => Observable<any>) {
    // console.log("transformResult added: ", url, response, processor);

    //Have to loop through each object to add the "Z" so that I can treat the incoming DateTime as UTC instead of local by default
    if (response?.data != null) {
      if (Array.isArray(response.data)) {
        response.data.forEach((item: any) => {
          Object.entries(item).forEach(([key, value]: any) => {
            //   console.log(value);
            var regex = new RegExp(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|)/g);
            if (regex.test(value)) {
              item[key] = value + 'Z';
            }
          });
        });
      } else {
        Object.entries(response?.data).forEach(([key, value]: any) => {
          //   console.log(value);
          var regex = new RegExp(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|)/g);
          if (regex.test(value)) {
            response.data[key] = value + 'Z';
          }
        });
      }
    }

    // console.log("transformResult new: ", url, response, processor);
    if (response.status == 401) {
      // console.log('Response 401');
      // window.location.href = '/login';
    }

    return processor(response);
  }

  async getToken(): Promise<any> {
    // return new Promise((resolve, reject) => {
    //   this.authService.getAccessTokenSilently().subscribe(res => {
    //     resolve(res);
    //   }, err => {
    //     reject(err);
    //   });
    // })
  }
  protected async transformOptions(options: any) {
    options.headers['Access-Control-Allow-Origin'] = '*';
    options.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept, Origin, Authorization';
    options.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    options.headers['Accept'] = '*/*';
    // options.withCredentials = true;

    // var token = await this.getToken();
    // options.headers.Authorization = "Bearer " + token;

    return Promise.resolve(options);
  }
  // @ts-ignore
  protected transformResponse(data: any): Observable<any> {
    let resp;
    try {
      resp = JSON.parse(data);
    } catch (error) {
      throw Error(`[requestClient] Error parsingJSON data - ${JSON.stringify(error)}`);
    }
    if (resp.status === 'success') {
      return resp.data;
    } else {
      throw Error(`Request failed with reason -  ${data}`);
    }
  }
}
