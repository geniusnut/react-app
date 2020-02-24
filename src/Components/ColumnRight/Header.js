import React from "react";
import AppStore from '../../Stores/ApplicationStore';

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            connectionState: AppStore.getConnectionState(),
            openDeleteDialog: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState !== this.state) {
            return true;
        }

        return false;
    }

    render() {
        return (
            <div className={'header'}>
            </div>
        )
    }
}

export default Header;