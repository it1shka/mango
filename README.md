## Mango: MongoDB CRUD Application

### Motivation:
This application was created as an additional project
for my databases course. Initially it only had an
ugly tkinter interface, but currently I'm implementing
browser interface using Vue.js

### Goals
1) Feature complete (support all possible CRUD operations on MongoDB)
2) User-friendly

### Screenshots
<img width="1440" alt="Screenshot 2024-07-03 at 17 24 05" src="https://github.com/it1shka/mango/assets/58363010/4e8c2b51-e221-4b95-bb40-2fba1184da30">
<img width="1440" alt="Screenshot 2024-07-03 at 17 25 25" src="https://github.com/it1shka/mango/assets/58363010/6d0c71e1-fbdf-4a3b-90e5-e4f8a913819a">
<img width="1440" alt="Screenshot 2024-07-04 at 15 15 35" src="https://github.com/it1shka/mango/assets/58363010/8691120c-b172-4228-9a81-9e6040eef924">

### How to use
> Download application from GitHub
> make _dev.sh_ executable (_chmod +x dev.sh_)
> run _./dev.sh init_ (it creates python environment and installs dependencies)
> run _./dev.sh start web_ to run the web version (preferred)
> run _./dev.sh start native_ to run Tkinter version (ugly)
All in all, the setup script is similar to:
```shell
git clone https://github.com/it1shka/mango
cd mango
chmod +x dev.sh
./dev.sh init
./dev.sh start web
```

### Status:
I implemented all features that I wanted. The application
still needs polishing here and there. Also it would be nice to
add some features like import/export of csv/json files.
New features and fixes will be added on request
if at least somebody except me will use this project.
So feel free to open an issue
