const qs = require('querystring');
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const config = require('./account.json')
// 跑路云签到页面
const email = config.email;
const passwd = config.pwd;

const onSign = async () => {
    try {
        const { headers } = await fetch('https://paoluz.net/auth/login');
        const cookie = headers.get('set-cookie') || '';
        const cfduid = getCookie('__cfduid', cookie);
        if (cfduid) {
            await login(cfduid);
        }
    } catch (error) {
        // error
    }
}

const login = async (uuid) => {
    const data = await fetch('https://paoluz.net/auth/login', {
        body: qs.stringify({
            email,
            passwd,
            code: '',
        }),
        method: 'POST', headers: {
            'cookie': `__cfduid=${uuid}; lang=zh-cn`,
            'content-type': 'application/x-www-form-urlencoded'
        }
    })
    const cookie = data.headers.get('set-cookie') || '';
    const cfduid = getCookie('__cfduid', cookie);
    const key = getCookie('key', cookie);
    const uid = getCookie('uid', cookie);
    const ip = getCookie('ip', cookie);
    const expire_in = getCookie('expire_in', cookie);
    const res = await data.json();
    if (res.ret === 1) {
        await checkin(cfduid, key, uid, ip, expire_in);
    }

}

const checkin = async (cfduid, key, uid, ip, expire_in) => {
    const data = await fetch('https://paoluz.net/user/checkin', {
        method: 'POST',
        headers: {
            cookie: `__cfduid=${cfduid}; lang=zh-cn; cnxad_lunbo=yes; _ga=GA1.2.1656003110.1594518881; _gid=GA1.2.1056328585.1594518881; uid=${uid}; email=704826318%40qq.com; key=${key}; ip=${ip}; expire_in=${expire_in}`
        }
    });
    const res = await data.json();
    if (res.ret === 1) {
        // success
    } else {
        // abnormal
    }
    console.log(JSON.stringify(res), '-', new Date().toString());
};

function getCookie(str, cookie) {
    return (cookie.match(`${str}=([^;]+)`) || [])[1]
}

var rule1 = new schedule.RecurrenceRule();
rule1.hour = 9;
rule1.minute = 0;
rule1.dayOfWeek = [new schedule.Range(0, 6)];
console.log('自动签到已启动..');
schedule.scheduleJob(rule1, function(){
  onSign();
});
// onSign();