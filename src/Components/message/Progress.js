import * as React from "react";

class Progress extends React.Component {
    render() {
        const { progress } = this.props
        return (
            <div className="progress-container">
                <div
                    className="progress-bar"
                    style={{width: progress}}
                />
            </div>
        )
    }
}

export default Progress;