import './style.css';

const init = () => {
  // DOM elements
  const header = document.getElementById('header');
  const form = document.getElementById('form');
  const filter = document.getElementById('filter');
  const list = document.getElementById('list');

  // Check if DOM elements exist to avoid null errors
  if (!header || !form || !filter || !list) {
    console.error('One or more required DOM elements are missing!');
    return;
  }

  // Stateful variables
  let inEditMode = false;
  let links = [];
  let formData = {
    title: "",
    url: "",
    type: "",
    description: "",
    paid: false,
  };
  let selectedLink = {
    id: "",
    title: "",
    url: "",
    type: "",
    description: "",
    paid: false,
  };
  let filterObj = {
    title: '',
    type: 'all',
    paid: 'all',
  };

  // Render header with "Show Form" button
  header.innerHTML = `
    <div class="flex flex-col items-center mb-4">
      <h1 class="text-3xl font-bold mb-4 text-center">Helpful Links</h1>
      <button id="showFormButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Show Form
      </button>
    </div>
  `;

  // Now get the button after it's added to the DOM
  const showFormButton = document.getElementById('showFormButton');

  // Initially hide the form
  form.style.display = 'none';
  list.style.display = 'block'; // Ensure list is always visible

  // Initial fetch
  fetchLinks();

  // Show form button handler
  showFormButton.addEventListener('click', () => {
    form.style.display = 'block';
    showFormButton.style.display = 'none'; // Hide the button when form is shown
  });

  // Render form
  function renderForm() {
    const formHtml = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <label for="inputTitle" class="block mb-2 text-sm font-bold text-gray-700">Title</label>
        <input type="text" id="inputTitle" class="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="title" placeholder="Website name goes here...">

        <label for="inputUrl" class="block mb-2 text-sm font-bold text-gray-700">URL</label>
        <input type="url" id="inputUrl" class="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="url" placeholder="URL goes here...">

        <label for="inputType" class="block mb-2 text-sm font-bold text-gray-700">Type</label>
        <select id="inputType" class="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="type">
          <option value="all" selected disabled>Choose type...</option>
          <option value="code">Code</option>
          <option value="music">Music</option>
        </select>

        <label for="inputDescription" class="block mb-2 text-sm font-bold text-gray-700">Description</label>
        <textarea id="inputDescription" class="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="description" placeholder="10 words max..."></textarea>

        <div class="flex items-center mb-4">
          <input type="checkbox" id="inputPaid" class="mr-2 leading-tight" name="paid">
          <label for="inputPaid" class="text-sm text-gray-700">Paid?</label>
        </div>

        <div class="mt-4 flex justify-between">
          <button type="submit" id="buttonSubmit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit</button>
          <button type="button" id="buttonClear" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Clear Form</button>
        </div>
        <button type="button" id="hideForm" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 w-full">Hide Form</button>
      </div>
    `;
    form.innerHTML = formHtml;

    document.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', handleFormInput);
    });

    document.getElementById('buttonSubmit').addEventListener('click', handleSubmitClick);
    document.getElementById('buttonClear').addEventListener('click', handleClearClick);
    document.getElementById('hideForm').addEventListener('click', () => {
      form.style.display = 'none';
      showFormButton.style.display = 'block';
    });
  }

  // Form handler functions
  function handleFormInput(e) {
    const { name, type, value, checked } = e.target;
    formData = {
      ...formData,
      [name]: type !== 'checkbox' ? value : checked,
    };
  }

  function handleSubmitClick(e) {
    e.preventDefault();
    let formInput = {};
    if (inEditMode) {
      selectedLink = {
        ...selectedLink,
        title: document.getElementById('inputTitle').value,
        url: document.getElementById('inputUrl').value,
        type: document.getElementById('inputType').value,
        description: document.getElementById('inputDescription').value,
        paid: document.getElementById('inputPaid').checked,
      };
      formInput = selectedLink;
      handleUpdatedLink(formInput);
    } else {
      formInput = formData;
      handleNewLink(formInput);
    }
    form.style.display = 'none';
    showFormButton.style.display = 'block';
  }

  function handleClearClick() {
    document.getElementById('buttonSubmit').textContent = "Submit";
    document.getElementById('inputTitle').value = '';
    document.getElementById('inputUrl').value = '';
    document.getElementById('inputType').value = 'all';
    document.getElementById('inputDescription').value = '';
    document.getElementById('inputPaid').checked = false;
    inEditMode = false;
  }

  // Render filter
  function renderFilter() {
    const filterHtml = `
      <div class="mb-4 p-4 rounded-md bg-white shadow-md flex gap-2">
        <input type='text' id='filterTitle' name='title' class='shadow-sm appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' placeholder='Filter by text...' />
        <select id='filterSelectType' name='type' class='shadow-sm appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'>
          <option value='all' selected>Show all (types)...</option>
          <option value='code'>Code</option>
          <option value='music'>Music</option>
        </select>
        <select id='filterSelectPaid' name='paid' class='shadow-sm appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'>
          <option value='all' selected>Show all (paid)...</option>
          <option value='paid'>Paid</option>
          <option value='free'>Free</option>
        </select>
        <select id='sortSelect' name='sort' class='shadow-sm appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'>
          <option value='all' selected disabled>Sort...</option>
          <option value='ascByTitle'>A-Z (title)</option>
          <option value='descByTitle'>Z-A (title)</option>
          <option value='ascByType'>A-Z (type)</option>
          <option value='descByType'>Z-A (type)</option>
          <option value='ascByPaid'>A-Z (paid)</option>
          <option value='descByPaid'>Z-A (paid)</option>
        </select>
        <button type='button' id='filterButtonClear' name='clear' class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Clear All</button>
      </div>
    `;
    filter.innerHTML = filterHtml;

    document.getElementById('filterTitle').addEventListener('input', handleFilter);
    document.getElementById('filterSelectType').addEventListener('change', handleFilter);
    document.getElementById('filterSelectPaid').addEventListener('change', handleFilter);
    document.getElementById('filterButtonClear').addEventListener('click', handleFilterClear);
    document.getElementById('sortSelect').addEventListener('change', handleSortSelect);
  }

  // Filter handlers
  function handleFilter(e) {
    const { name, value } = e.target;
    filterObj = { ...filterObj, [name]: value };
    const currentFilter = filterObj;
    const filteredList = [...links].filter(link =>
      (link.title.toLowerCase().includes(currentFilter.title.toLowerCase()) ||
        link.description.toLowerCase().includes(currentFilter.title.toLowerCase()) ||
        currentFilter.title === '') &&
      (link.type === currentFilter.type || currentFilter.type === 'all') &&
      ((link.paid ? 'paid' : 'free') === currentFilter.paid || currentFilter.paid === 'all')
    );
    renderList(filteredList);
  }

  function handleFilterClear() {
    document.getElementById('filterTitle').value = "";
    document.getElementById('filterSelectType').value = "all";
    document.getElementById('filterSelectPaid').value = "all";
    document.getElementById('sortSelect').value = 'all';
    filterObj = { title: '', type: 'all', paid: 'all' };
    renderList(links);
  }

  function handleSortSelect(e) {
    let sortedList = [];
    const { value } = e.target;
    switch (value) {
      case "ascByTitle":
        sortedList = [...links].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "descByTitle":
        sortedList = [...links].sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "ascByType":
        sortedList = [...links].sort((a, b) => a.type.localeCompare(b.type));
        break;
      case "descByType":
        sortedList = [...links].sort((a, b) => b.type.localeCompare(a.type));
        break;
      case "ascByPaid":
        sortedList = [...links].sort((a, b) => Number(a.paid) - Number(b.paid));
        break;
      case "descByPaid":
        sortedList = [...links].sort((a, b) => Number(b.paid) - Number(a.paid));
        break;
      default:
        sortedList = links;
    }
    renderList(sortedList);
  }

  // Render list
  function renderList(data) {
    const linkList = data.map(link => `
      <tr class="border-b border-gray-200 hover:bg-gray-50">
        <td class="py-2 px-4 text-sm text-gray-500">${link.id || 'N/A'}</td>
        <td class="py-2 px-4 text-sm">${link.title || ''}</td>
        <td class="py-2 px-4 text-sm text-gray-500">${link.type || ''}</td>
        <td class="py-2 px-4 text-sm text-gray-500">${link.description || ''}</td>
        <td class="py-2 px-4 text-sm text-gray-500">${link.paid ? "paid" : "free"}</td>
        <td class="py-2 px-4">
          <button type="button" data-id="${link.id}" data-name="view" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs">View</button>
        </td>
        <td class="py-2 px-4">
          <button type="button" data-id="${link.id}" data-name="edit" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs">Edit</button>
        </td>
        <td class="py-2 px-4">
          <button type="button" data-id="${link.id}" data-name="del" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">Del</button>
        </td>
        <td class="py-2 px-4 text-sm text-red-500">${link.url === "" ? "🚫 URL" : ""} ${link.id === "" ? "🚫 ID" : ""}</td>
      </tr>
    `).join('');

    list.innerHTML = `
      <div class="overflow-x-auto shadow-sm rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">$</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">⚠</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">${linkList}</tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('#list button').forEach(btn => {
      btn.addEventListener('click', handleListButtonClick);
    });
  }

  // List button handler
  function handleListButtonClick(e) {
    const id = e.target.dataset.id;
    const name = e.target.dataset.name;
    const linkObject = links.find(link => link.id === id);
    if (!linkObject) return;

    switch (name) {
      case 'view':
        onViewClick(linkObject);
        selectedLink = linkObject;
        break;
      case 'edit':
        inEditMode = true;
        document.getElementById('buttonSubmit').textContent = "Update";
        onEditClick(linkObject);
        selectedLink = linkObject;
        form.style.display = 'block';
        showFormButton.style.display = 'none';
        break;
      case 'del':
        handleDelete(linkObject);
        break;
    }
  }

  // View and Edit handlers
  function onViewClick(obj) {
    if (!obj.url) {
      console.error('The URL is empty!');
      return;
    }
    window.open(obj.url, '_blank');
  }

  function onEditClick(obj) {
    selectedLink = obj;
    document.getElementById('inputTitle').value = obj.title || '';
    document.getElementById('inputUrl').value = obj.url || '';
    document.getElementById('inputType').value = obj.type || 'all';
    document.getElementById('inputDescription').value = obj.description || '';
    document.getElementById('inputPaid').checked = obj.paid || false;
  }

  // Async functions
  async function fetchLinks() {
    try {
      const r = await fetch(`http://localhost:3000/links`);
      if (!r.ok) throw new Error('GET: bad request');
      const data = await r.json();
      links = data;
      renderList(data);
      renderForm();
      renderFilter();
    } catch (error) {
      console.error('Fetch error:', error);
      // Mock data for testing without backend
      links = [
        { id: '1', title: 'Example', url: 'https://example.com', type: 'code', description: 'Test link', paid: false }
      ];
      renderList(links);
      renderForm();
      renderFilter();
    }
  }

  async function handleNewLink(newObj) {
    try {
      const r = await fetch(`http://localhost:3000/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newObj),
      });
      if (!r.ok) throw new Error('POST: bad request');
      await fetchLinks();
    } catch (error) {
      console.error('POST error:', error);
      // Mock adding for testing
      links.push({ ...newObj, id: Date.now().toString() });
      renderList(links);
    }
  }

  async function handleDelete(obj) {
    try {
      const r = await fetch(`http://localhost:3000/links/${obj.id}`, {
        method: 'DELETE',
      });
      if (!r.ok) throw new Error('DELETE: bad request');
      await fetchLinks();
    } catch (error) {
      console.error('DELETE error:', error);
      links = links.filter(link => link.id !== obj.id);
      renderList(links);
    }
  }

  async function handleUpdatedLink(updatedObj) {
    try {
      const r = await fetch(`http://localhost:3000/links/${updatedObj.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedObj),
      });
      if (!r.ok) throw new Error('PATCH: bad request');
      await fetchLinks();
    } catch (error) {
      console.error('PATCH error:', error);
      links = links.map(link => link.id === updatedObj.id ? updatedObj : link);
      renderList(links);
    }
    inEditMode = false;
  }
};

window.addEventListener("DOMContentLoaded", init);