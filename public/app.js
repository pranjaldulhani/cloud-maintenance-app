const list = document.getElementById('list');
const msg = document.getElementById('msg');

async function loadUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();
  list.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u.name + ' - ' + u.email; // textContent = XSS safe
    list.appendChild(li);
  });
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value
    })
  });
  const data = await res.json();
  msg.textContent = res.ok ? data.message : data.errors[0].msg;
  loadUsers();
});

loadUsers();