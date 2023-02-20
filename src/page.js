const DEFAULT_SETTINGS = {
  laterStartsHour: 3,
  tonightStartsHour: 19,
  tomorrowStartsHour: 9,
  weekendStartsDay: 6,
  weekStartsDay: 1,
  somedayMonths: 3,
};

function App() {
  const [route, setRoute] = React.useState(() =>
    window.location.hash.includes("#settings") ? "settings" : "list"
  );
  function onNavigate(route) {
    window.location.hash = `#${route}`;
    setRoute(route);
  }
  return (
    <div className="h-full w-full">
      <Header route={route} onNavigate={onNavigate} />
      {route === "list" ? <List /> : <Settings />}
    </div>
  );
}

function Header({ route, onNavigate }) {
  return (
    <div className="fixed h-16 w-full flex bg-yellow-400 text-white px-6 drop-shadow-md items-center">
      <div className="flex text-xl mr-6 items-center">
        <div className="-mt-1 h-8 w-8 mr-2">
          <IconMoon />
        </div>
        TabNap
      </div>
      <div
        className={`m-1 mr-2 py-2 px-4 rounded flex text-lg items-center hover:bg-yellow-500 cursor-pointer ${
          route === "list" ? "bg-yellow-500" : ""
        }`}
        onClick={() => {
          onNavigate("list");
        }}
      >
        <div className="h-5 w-5 mr-2">
          <IconBed />
        </div>
        Home
      </div>
      <div
        className={`m-1 flex py-2 px-4 rounded flex text-lg items-center hover:bg-yellow-500 cursor-pointer ${
          route === "settings" ? "bg-yellow-500" : ""
        }`}
        onClick={() => {
          onNavigate("settings");
        }}
      >
        <div className="h-5 w-5 mr-2 ">
          <IconSetting />
        </div>
        Settings
      </div>
    </div>
  );
}

function List() {
  const [tabs, setTabs] = React.useState([]);
  React.useEffect(() => {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === "tabs") {
          console.log("all tabs in storage", newValue);
          setTabs(newValue);
        }
      }
    });

    chrome.storage.local.get(["tabs"]).then((result) => {
      console.log("tabs", result.tabs);
      if (result != null && result.tabs != null) {
        console.log("setting tabs");
        setTabs(result.tabs);
      }
    });
  }, []);

  console.log("rendering tabs", tabs, tabs.map);
  return (
    <div className="pt-20 w-full h-full flex justify-center text-lg text-slate-500 py-10">
      <div className="min-w-96">
        <h1>Snoozed Tabs</h1>
        {tabs.map((tab) => {
          console.log(tab);
          return (
            <div className="flex items-center border-b">
              <div
                className="flex hover:bg-slate-100 rounded p-4 items-center cursor-pointer"
                onClick={() => {
                  chrome.tabs.create({ url: tab.url });
                }}
              >
                <div className="mr-4">
                  <img src={tab.favicon} alt="" className="h-6 w-6" />
                </div>
                <div className="w-96 flex-1 mr-2 flex flex-col text-ellipsis overflow-hidden">
                  <div className="">{tab.title || tab.url}</div>
                  <div className="flex">
                    <div className="text-sm text-slate-400 mr-4">
                      {tab.label}
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(tab.when).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="hover:bg-slate-100 rounded p-4 items-center cursor-pointer"
                onClick={() => {
                  const newTabs = tabs.filter((t) => t !== tab);
                  console.log("new tabs", newTabs);
                  chrome.storage.local
                    .set({ tabs: newTabs })
                    .then((value) => {});
                }}
              >
                <div className="h-4 w-4">
                  <IconTrash />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dropdown({ children, value, onChange }) {
  return (
    <select
      className="ml-6 py-1 px-2 rounded bg-slate-200 cursor-pointer outline-none text-slate-500"
      onChange={onChange}
      value={value}
    >
      {children}
    </select>
  );
}

function Setting({ icon, text, value, onChange, children }) {
  return (
    <div className="flex items-center border-b py-4">
      <div className="h-6 w-6 mr-6 -mt-1">{icon}</div>
      <div className="flex-1">{text}</div>
      <div className="w-16"></div>
      <Dropdown value={value} onChange={onChange}>
        {children}
      </Dropdown>
    </div>
  );
}

function updateSettings(settings) {
  chrome.storage.local.set({ settings });
}

function Settings() {
  const [settings, setSettings] = React.useState(DEFAULT_SETTINGS);

  React.useEffect(() => {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === "settings") {
          setSettings(newValue);
        }
      }
    });
    chrome.storage.local.get(["settings"]).then((result) => {
      console.log("tabs", result.settings);
      if (result != null && result.settings != null) {
        console.log("setting tabs");
        setSettings(result.settings);
      }
    });
  }, []);
  return (
    <div className="pt-20 w-full h-full flex flex-col items-center text-lg text-slate-500 py-10">
      <div className="min-w-96 flex flex-col">
        <h1 className="text-left mb-6">Snooze Settings</h1>
        <Setting
          value={settings.laterStartsHour}
          icon={<IconMug />}
          text="Later Today starts"
          onChange={(e) => {
            updateSettings({
              ...settings,
              laterStartsHour: parseInt(e.target.value),
            });
            console.log("changing to", e.target.value);
          }}
        >
          <option value="1">in 1 hours</option>
          <option value="2">in 2 hours</option>
          <option value="3">in 3 hours</option>
          <option value="4">in 4 hours</option>
          <option value="5">in 5 hours</option>
        </Setting>
        <Setting
          value={settings.tonightStartsHour}
          icon={<IconMoon />}
          text="Tonight starts at"
          onChange={(e) => {
            updateSettings({
              ...settings,
              tonightStartsHour: parseInt(e.target.value),
            });
            console.log("changing to", e.target.value);
          }}
        >
          <option value="15">3:00 PM</option>
          <option value="16">4:00 PM</option>
          <option value="17">5:00 PM</option>
          <option value="18">6:00 PM</option>
          <option value="19">7:00 PM</option>
          <option value="20">8:00 PM</option>
          <option value="21">9:00 PM</option>
          <option value="22">10:00 PM</option>
          <option value="23">11:00 PM</option>
        </Setting>
        <Setting
          value={settings.tomorrowStartsHour}
          icon={<IconSun />}
          text="Tomorrow starts at"
          onChange={(e) => {
            updateSettings({
              ...settings,
              tomorrowStartsHour: parseInt(e.target.value),
            });
            console.log("changing to", e.target.value);
          }}
        >
          <option value="4">4:00 AM</option>
          <option value="5">5:00 AM</option>
          <option value="6">6:00 AM</option>
          <option value="7">7:00 AM</option>
          <option value="8">8:00 AM</option>
          <option value="9">9:00 AM</option>
          <option value="10">10:00 AM</option>
          <option value="11">11:00 AM</option>
        </Setting>
        <Setting
          value={settings.weekendStartsDay}
          icon={<IconCouch />}
          text="Weekend starts on"
          onChange={(e) => {
            updateSettings({
              ...settings,
              weekendStartsDay: parseInt(e.target.value),
            });
            console.log("changing to", e.target.value);
          }}
        >
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
        </Setting>
        <Setting
          value={settings.weekStartsDay}
          icon={<IconBackpack />}
          text="Week starts on"
          onChange={(e) => {
            updateSettings({
              ...settings,
              weekStartsDay: parseInt(e.target.value),
            });
            console.log("changing to", e.target.value);
          }}
        >
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
        </Setting>
        <Setting
          value={settings.somedayMonths}
          icon={<IconBeach />}
          text="Someday is in"
          onChange={(e) => {
            updateSettings({
              ...settings,
              somedayMonths: parseInt(e.target.value),
            });
            console.log("changing to", e.target.value);
          }}
        >
          <option value="2">2 months</option>
          <option value="3">3 months</option>
          <option value="4">4 months</option>
          <option value="5">5 months</option>
          <option value="6">6 months</option>
        </Setting>
      </div>
    </div>
  );
}
function IconMoon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M320 32L304 0l-16 32-32 16 32 16 16 32 16-32 32-16zm138.7 149.3L432 128l-26.7 53.3L352 208l53.3 26.7L432 288l26.7-53.3L512 208z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M332.2 426.4c8.1-1.6 13.9 8 8.6 14.5a191.18 191.18 0 0 1-149 71.1C85.8 512 0 426 0 320c0-120 108.7-210.6 227-188.8 8.2 1.6 10.1 12.6 2.8 16.7a150.3 150.3 0 0 0-76.1 130.8c0 94 85.4 165.4 178.5 147.7z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMug() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M139.3 67.3a94.83 94.83 0 0 1-26.4-53.5A16.11 16.11 0 0 0 96.8 0H80.4a16.31 16.31 0 0 0-16.3 18 145.36 145.36 0 0 0 40.6 84.4 81.22 81.22 0 0 1 22.4 44.1 16.23 16.23 0 0 0 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18a130.72 130.72 0 0 0-36.6-74.7zM287.9 142a130.72 130.72 0 0 0-36.6-74.7 94.83 94.83 0 0 1-26.4-53.5A16.11 16.11 0 0 0 208.8 0h-16.4c-9.8 0-17.5 8.5-16.3 18a145.36 145.36 0 0 0 40.6 84.4 81.22 81.22 0 0 1 22.4 44.1 16.23 16.23 0 0 0 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M400 192H32a32 32 0 0 0-32 32v192a96 96 0 0 0 96 96h192a96 96 0 0 0 96-96h16a112 112 0 0 0 0-224zm0 160h-16v-96h16a48 48 0 0 1 0 96z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconSun() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M502.42 240.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.41-94.8a17.31 17.31 0 0 0-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4a17.31 17.31 0 0 0 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.41-33.5 47.3 94.7a17.31 17.31 0 0 0 31 0l47.31-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3a17.33 17.33 0 0 0 .2-31.1zm-155.9 106c-49.91 49.9-131.11 49.9-181 0a128.13 128.13 0 0 1 0-181c49.9-49.9 131.1-49.9 181 0a128.13 128.13 0 0 1 0 181z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M352 256a96 96 0 1 1-96-96 96.15 96.15 0 0 1 96 96z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCouch() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
      <path
        d="M96 160H64a96 96 0 0 1 96-96h320a96 96 0 0 1 96 96h-32a64.06 64.06 0 0 0-64 64v64H160v-64a64.06 64.06 0 0 0-64-64z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M640 256a63.84 63.84 0 0 1-32 55.1V432a16 16 0 0 1-16 16h-64a16 16 0 0 1-16-16v-16H128v16a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V311.1A63.79 63.79 0 0 1 64 192h32a32 32 0 0 1 32 32v96h384v-96a32 32 0 0 1 32-32h32a64.06 64.06 0 0 1 64 64z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconBackpack() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path
        d="M320 320H128a32 32 0 0 0-32 32v32h256v-32a32 32 0 0 0-32-32zM136 208h176a8 8 0 0 0 8-8v-16a8 8 0 0 0-8-8H136a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M96 512h256v-96H96zM320 80h-8V56a56.06 56.06 0 0 0-56-56h-64a56.06 56.06 0 0 0-56 56v24h-8A128 128 0 0 0 0 208v240a64 64 0 0 0 64 64V352a64.07 64.07 0 0 1 64-64h192a64.07 64.07 0 0 1 64 64v160a64 64 0 0 0 64-64V208A128 128 0 0 0 320 80zM184 56a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v24h-80zm136 144a8 8 0 0 1-8 8H136a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMailbox() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path
        d="M432 64H144a144 144 0 0 1 144 144v208a32 32 0 0 1-32 32h288a32 32 0 0 0 32-32V208A144 144 0 0 0 432 64zm80 208a16 16 0 0 1-16 16h-32a16 16 0 0 1-16-16v-48h-56a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h104a16 16 0 0 1 16 16z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M143.93 64C64.2 64 0 129.65 0 209.38V416a32 32 0 0 0 32 32h224a32 32 0 0 0 32-32V208A144 144 0 0 0 143.93 64zM224 240a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16zm272-48H392a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h56v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconBeach() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path
        d="M284.91 358.8a144 144 0 0 0-43.71-6.8h-45.07c10-42.85 25-122.77 21-202.33L238.89 128h27.39c11.16 48 28.58 142.41 18.63 230.8z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M241.2 352h-98.4A144 144 0 0 0 .36 474.78C-2.53 494.3 12.39 512 32.12 512h319.76c19.73 0 34.65-17.7 31.76-37.22A144 144 0 0 0 241.2 352zm206.62-238.36C439.69 67.43 393 32 336.53 32c-34.88 0-65.66 13.82-86.3 35.08C235.78 28.29 193.72 0 143.47 0 87 0 40.31 35.43 32.18 81.64a12.37 12.37 0 0 0 10.24 14.2 12.24 12.24 0 0 0 2.18.16H80l16-32 16 32h30.17c-34.21 35-39.62 86.88-14.54 122.58 4.36 6.2 13.14 7.31 18.5 1.95L238.89 128H368l16-32 16 32h35.4a12.38 12.38 0 0 0 12.6-12.18 12.24 12.24 0 0 0-.18-2.18z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}
function IconBed() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M512,288v64H0V288a64,64,0,0,1,64-64H448A64,64,0,0,1,512,288Z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M0,352V464a16,16,0,0,0,16,16H48a16,16,0,0,0,16-16V416H448v48a16,16,0,0,0,16,16h32a16,16,0,0,0,16-16V352ZM64,224V160a32,32,0,0,1,32-32H208a32,32,0,0,1,32,32v64h32V160a32,32,0,0,1,32-32H416a32,32,0,0,1,32,32v64a66.4,66.4,0,0,1,32,8.88h0V64a32,32,0,0,0-32-32H64A32,32,0,0,0,32,64V232.88h0A66.51,66.51,0,0,1,64,224Z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}
function IconSetting() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M487.75 315.6l-42.6-24.6a192.62 192.62 0 0 0 0-70.2l42.6-24.6a12.11 12.11 0 0 0 5.5-14 249.2 249.2 0 0 0-54.7-94.6 12 12 0 0 0-14.8-2.3l-42.6 24.6a188.83 188.83 0 0 0-60.8-35.1V25.7A12 12 0 0 0 311 14a251.43 251.43 0 0 0-109.2 0 12 12 0 0 0-9.4 11.7v49.2a194.59 194.59 0 0 0-60.8 35.1L89.05 85.4a11.88 11.88 0 0 0-14.8 2.3 247.66 247.66 0 0 0-54.7 94.6 12 12 0 0 0 5.5 14l42.6 24.6a192.62 192.62 0 0 0 0 70.2l-42.6 24.6a12.08 12.08 0 0 0-5.5 14 249 249 0 0 0 54.7 94.6 12 12 0 0 0 14.8 2.3l42.6-24.6a188.54 188.54 0 0 0 60.8 35.1v49.2a12 12 0 0 0 9.4 11.7 251.43 251.43 0 0 0 109.2 0 12 12 0 0 0 9.4-11.7v-49.2a194.7 194.7 0 0 0 60.8-35.1l42.6 24.6a11.89 11.89 0 0 0 14.8-2.3 247.52 247.52 0 0 0 54.7-94.6 12.36 12.36 0 0 0-5.6-14.1zm-231.4 36.2a95.9 95.9 0 1 1 95.9-95.9 95.89 95.89 0 0 1-95.9 95.9z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M256.35 319.8a63.9 63.9 0 1 1 63.9-63.9 63.9 63.9 0 0 1-63.9 63.9z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path
        d="M53.2 467L32 96h384l-21.2 371a48 48 0 0 1-47.9 45H101.1a48 48 0 0 1-47.9-45z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M0 80V48a16 16 0 0 1 16-16h120l9.4-18.7A23.72 23.72 0 0 1 166.8 0h114.3a24 24 0 0 1 21.5 13.3L312 32h120a16 16 0 0 1 16 16v32a16 16 0 0 1-16 16H16A16 16 0 0 1 0 80z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<App />);
