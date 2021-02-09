(() => {
    const selector = selector => {
        const el = document.querySelector(selector);
        return el;
    }

    const create = element => {
        const el = document.createElement(element);
        return el;
    }

    const app = selector('#app');
    const Login = create('div');

    Login.classList.add('login');

    const Logotipo = create('img');
    Logotipo.src = './assets/images/logo.svg';
    Logotipo.classList.add('logotipo');

    const Form = create('form');

    Form.onsubmit = async e => {
        e.preventDefault();

        const [email, password] = document.querySelectorAll("input")
        const {url} = await fakeAuthenticate(email.value, password.value);

        location.href='#users';

        const users = await getDevelopersList(url);
        renderPageUsers(users);
    };

    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        (!email.validity.valid || !email.value || password.value.length <= 5)
            ? button.setAttribute('disabled','disabled')
            : button.removeAttribute('disabled');
    };

    Form.innerHTML = `
    <input type="email" name="email" id="email" placeholder="Entre com seu e-mail" required />
    <input type="password" name="password" id="password" placeholder="Digite sua senha" required />
    <button name="btn btn--open" id="btnOpen" disabled>Entrar</button>`;

    app.appendChild(Logotipo);
    Login.appendChild(Form);

    async function fakeAuthenticate(email, password) {

        let url = "http://www.mocky.io/v2/5dba690e3000008c00028eb6";
        let data = await fetch(url)
            .then(res => {
                if (!res.ok) {
                    throw Error(res.statusText);
                }
                return res.json();
            })
            .catch(e => {
                console.log(e);
                alert("Houve uma falha de comunicação, Tente novamente mais tarde!");
            });

        const fakeJwtToken = `${btoa(email+password)}.${btoa(data.url)}.${(new Date()).getTime()+300000}`;

        localStorage.setItem("token", fakeJwtToken);

        return data;
    }

    async function getDevelopersList(url) {

        let data = await fetch(url)
        .then(res => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.json();
        })
        .catch(e => {
            alert("Houve uma falha de comunicação, tente novamente mais tarde!");

            localStorage.removeItem("token");
            document.location.reload(true);
        });

        return data;
    }

    function renderPageUsers(users) {
        app.classList.add('logged');
        Login.style.display = "none";

        const Ul = create('ul');
        Ul.classList.add('container')

        users.map(user => {
            const li = create("li");
            const img = create("img");
            const span = create("span");

            img.setAttribute("src", user.avatar_url);
            img.setAttribute("alt", user.login);

            span.innerHTML = user.login;

            li.appendChild(img);
            li.appendChild(span);
            Ul.appendChild(li);
        });

        app.appendChild(Ul)
    }

    // init
    (async function(){
        const rawToken = localStorage.getItem("token");
        const token = rawToken ? rawToken.split('.') : null
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href='#login';
            app.appendChild(Login);
        } else {
            location.href='#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })();
})();