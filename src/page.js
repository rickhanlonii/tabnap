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
        className={`m-1 flex py-2 px-4 rounded text-lg items-center hover:bg-yellow-500 cursor-pointer ${
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
  const tabs = useChromeStorage("tabs", []);
  return (
    <div className="pt-20 w-full h-full flex justify-center text-lg text-slate-500 py-10">
      <div className="min-w-96">
        <h1>Snoozed Tabs</h1>
        {tabs.map((tab) => {
          return (
            <div
              key={`${tab.url}-${tab.when}`}
              className="flex items-center border-b"
            >
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
  const settings = useChromeStorage("settings", DEFAULT_SETTINGS);
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
          }}
        >
          <option value="1">in 1 hour</option>
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
