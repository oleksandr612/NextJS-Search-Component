// HOW TO IMPORT THIS COMPONENT:
// disable ssr for random id
// import dynamic from 'next/dynamic'
// const SearchInput = dynamic(import('../components/searchinput').then(mod => mod.SearchInput), { ssr: false })

import useSWR from "swr";

function get_random_5chars() {
    return Math.random().toString(36).slice(2, 7);
}


function SearchInput({
    input_props = { id: "", name: "", default: "", placeholder: "", required: false },
    dropdown = {
        data_or_async_func,
        data_id,
        data_keys: { label: "label", value: "value", icon: "icon" }
    },
    style_names = { container: "container", inputbox: "inputbox", dropdownbox: "dropdownbox", btnclear: "btnclear" } }) {


    let container_id = `sdd_${get_random_5chars()}`
    let dropdownbox_id = `${container_id}_ddb_${get_random_5chars()}`
    let inputbox_id = `${container_id}_ib_${get_random_5chars()}`

    const ids = {
        container: container_id,
        dropdownbox: dropdownbox_id,
        inputbox: inputbox_id
    }

    console.log('ids :>> ', ids);


    if (!input_props) { input_props = {} }


    return (
        <>
            <div id={ids.container_id} className={style_names.container}
                onBlur={() => { hide_dropdownbox(ids) }}
            >
                <InputBox
                    ids={ids}
                    input_props={input_props}
                    style_names={style_names}
                />
                {(dropdown && dropdown.data_keys) && <DropdownBox
                    ids={ids}
                    dropdown={dropdown}
                    style_names={style_names}
                    hide_dropdownbox={hide_dropdownbox}
                />}

            </div>
        </>
    )
}



function InputBox({ ids, input_props, style_names }) {
    return (<>
        <div
            id={ids.inputbox}
            className={style_names.inputbox}

        >
            <label
                onClick={(e) => { show_dropdwnbox(ids); }}
            ></label>
            <input

                type="text"
                onBlur={(e) => { e.preventDefault() }}
                onChange={(e) => { change_handler(ids); show_dropdwnbox(ids) }}
                onClick={(e) => { show_dropdwnbox(ids); e.target.focus(); }}

                name={input_props.name}
                defaultValue={input_props.default}
                placeholder={input_props.placeholder}
                required={input_props.required}
            />
            <span className={style_names.btnclear}
                onClick={() => { clear_input(ids) }}
            ></span>
        </div>
    </>)
}

async function get_data({ data_id, data_or_async_func }) {
    if (typeof (data_or_async_func) === "function") { return await data_or_async_func() }
    else { return data_or_async_func }
}

function useData(data_id, data_or_async_func) {
    const { data, error } = useSWR({ data_id, data_or_async_func }, get_data)
    return { data: data, isloading: !data && !error, error: error }
}

function DropdownBox({ ids, dropdown, style_names }) {
    const { data, isloading, error } = useData(dropdown.data_id, dropdown.data_or_async_func)

    if (error) return <div>error:{error.toString()}</div>
    if (isloading) return <div>loading list...</div>

    return (
        <>
            <ul id={ids.dropdownbox} className={style_names.dropdownbox}>
                {make_dropdown_options(ids, data, dropdown.data_keys)}
            </ul>
        </>
    )
}


function make_dropdown_options(ids, data, data_keys) {

    function Row({ value, label, icon_url }) {
        return (
            <>
                <li
                    value={value}
                    onMouseDown={(e) => { select_handler(e, ids) }}
                // onClick not working, because click waits for the mouseup event, that never is triggered because blur comes first, hiding the panel.
                >
                    {icon_url && <img src={icon_url} />}
                    {label}
                </li>
            </>
        )
    }

    let rows = []
    var item, index
    for (index in data) {
        item = data[index]
        rows.push(
            <Row
                key={index}
                value={item[data_keys.value]}
                label={item[data_keys.label]}
                icon_url={item[data_keys.icon]}
            />
        )
    }

    return rows
}

function select_handler(e, ids) {
    let val = e.target.getAttribute("value")
    let inputbox = document.getElementById(ids.inputbox)
    let input = inputbox.getElementsByTagName("input")[0];
    let label = inputbox.getElementsByTagName("label")[0];
    //

    input.value = val
    //
    label.innerHTML = e.target.innerHTML
    hide_dropdownbox(ids)
    change_handler(ids)
}

function clear_input(ids) {
    let input = document.getElementById(ids.inputbox).getElementsByTagName("input")[0];
    input.value = ""
    show_dropdwnbox(ids)
    change_handler(ids)
    input.focus()
}

function change_handler(ids) {
    var input, filter, ul, li_list, li_value, li_label, i
    var selected = null
    let inputbox = document.getElementById(ids.inputbox)
    input = inputbox.getElementsByTagName("input")[0];
    filter = input.value.toUpperCase();
    ul = document.getElementById(ids.dropdownbox);
    li_list = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li_list.length; i++) {
        li_value = li_list[i].getAttribute("value")
        li_label = li_list[i].innerHTML
        if (li_value === input.value) { selected = { value: li_value, label: li_label } }
        if (li_value.toUpperCase().indexOf(filter) > -1 || li_label.toUpperCase().indexOf(filter) > -1) {
            li_list[i].style.display = "";
        } else {
            li_list[i].style.display = "none";
        }
    }


    let label = inputbox.getElementsByTagName("label")[0];
    if (selected) {
        label.innerHTML = selected.label;
    }
    else {
        label.innerHTML = ""
    }



}



function hide_dropdownbox(ids) {
    let ul = document.getElementById(ids.dropdownbox);
    ul.style.display = "none";
}


function show_dropdwnbox(ids) {
    let ul = document.getElementById(ids.dropdownbox);
    ul.style.display = "block";
}



export { SearchInput }