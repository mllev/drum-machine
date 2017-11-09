import React from 'react'
import ReactDOM from 'react-dom'
import './Main.css'

class DrumMachine extends React.Component {
  constructor (props) {
    super(props)

    this.instruments = [
      (new Audio('https://raw.githubusercontent.com/n1k0/tinysynth/master/public/audio/kick-classic.wav')),
      (new Audio('https://raw.githubusercontent.com/n1k0/tinysynth/master/public/audio/snare-block.wav')),
      (new Audio('https://raw.githubusercontent.com/n1k0/tinysynth/master/public/audio/hihat-digital.wav')),
      (new Audio('https://raw.githubusercontent.com/n1k0/tinysynth/master/public/audio/openhat-808.wav')),
      (new Audio('https://raw.githubusercontent.com/n1k0/tinysynth/master/public/audio/tom-acoustic01.wav')),
      (new Audio('https://raw.githubusercontent.com/n1k0/tinysynth/master/public/audio/tom-acoustic02.wav'))
    ]

    this.state = {
      tapped: [
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false]
      ],
      instruments: [
        this.instruments[0],
        this.instruments[1],
        this.instruments[2]
      ],
      names: [
        'kick', 'snare', 'hi-hat'
      ],
      bpm: 130,
      isPlaying: false,
      currentColumn: -1
    }

    this.columnCount = 8

    this.addRow = this.addRow.bind(this)
    this.clearRow = this.clearRow.bind(this)
    this.togglePlay = this.togglePlay.bind(this)
    this.changeInstrument = this.changeInstrument.bind(this)
  }

  songLoop () {
    const drumMachine = this
    this.timeout = setTimeout(function () {
      let column = (drumMachine.state.currentColumn + 1) % drumMachine.columnCount
      drumMachine.state.tapped.forEach((row, i) => {
        if (row[column]) {
          const pad = drumMachine.state.instruments[i]
          pad.pause()
          pad.currentTime = 0
          pad.play()
        }
      })
      // Increment column and recursive call
      drumMachine.setState({currentColumn: column})
      drumMachine.songLoop()
    }, 60000 / this.state.bpm)
  }

  togglePlay (isPlaying) {
    if (isPlaying) {
      this.setState({isPlaying: false, currentColumn: -1})
      clearTimeout(this.timeout)
    } else {
      this.setState({isPlaying: true, currentColumn: -1})
      this.songLoop()
    }
  }

  addRow () {
    let rows = this.state.tapped.slice()
    let instr = this.state.instruments.slice()
    let names = this.state.names.slice()
    rows.push([false, false, false, false, false, false, false, false])
    instr.push((new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/152714/Kick_11.wav')))
    names.push('kick')
    this.setState({tapped: rows, instruments: instr, names: names})
  }

  deleteRow (rowIndex) {
    let rows = this.state.tapped.slice()
    let instr = this.state.instruments.slice()
    let names = this.state.names.slice()
    rows.splice(rowIndex, 1)
    instr.splice(rowIndex, 1)
    names.splice(rowIndex, 1)
    this.setState({tapped: rows, instruments: instr, names: names})
  }

  clearRow (rowIndex) {
    let rows = this.state.tapped.slice()
    rows[rowIndex] = [false, false, false, false, false, false, false, false]
    this.setState({tapped: rows})
  }

  changeInstrument (row, instrument) {
    let instruments = this.state.instruments.slice()
    let names = this.state.names.slice()
    let instrToReplace
    let nameToReplace

    switch (instrument) {
      case 'kick':
        instrToReplace = this.instruments[0]
        nameToReplace = instrument
        break
      case 'snare':
        instrToReplace = this.instruments[1]
        nameToReplace = instrument
        break
      case 'hi-hat':
        instrToReplace = this.instruments[2]
        nameToReplace = instrument
        break
      case 'open-hat':
        instrToReplace = this.instruments[3]
        nameToReplace = instrument
        break
      case 'tom1':
        instrToReplace = this.instruments[4]
        nameToReplace = instrument
        break
      case 'tom2':
        instrToReplace = this.instruments[5]
        nameToReplace = instrument
    }

    instruments[row] = instrToReplace
    names[row] = nameToReplace
    this.setState({instruments: instruments, names: names})
  }

  renderPad (col, pad) {
    return (
      <div
        className={this.state.tapped[col][pad] ? 'drumpad-active' : 'drumpad'}
        onClick={() => {
          let tapped = this.state.tapped.slice()
          tapped[col][pad] = !tapped[col][pad]
          this.setState({tapped: tapped})
        }}></div>
    )
  }

  render () {
    return (
      <div>
        <header>
          <h1>BeatZ</h1>
          <h4>By Jon Franco</h4>
        </header>

        <div className='tools'>
          {/* Play/Stop Button */}
          <button onClick={() => this.togglePlay(this.state.isPlaying)}>{this.state.isPlaying ? 'Stop' : 'Play'}</button>

          {/* BPM Slider */}
          <div id='bpm-slider'>
            <p>BPM</p>
            <input
              type='range'
              min='60'
              max='200'
              onChange={(e) => { this.setState({bpm: e.target.value}) }}
              /><p>{this.state.bpm}</p>
          </div>
        </div>

        <div className='padrows'>
          <div></div>
          {/* Background Loop Containers */}
          <div className='column-container'>
            {[0,1,2,3,4,5,6,7].map((num) => {
              return <div className={'column' + (this.state.currentColumn === num ? ' active' : '')}></div>
            })}
          </div>

          {/* Render all rows in current state array */}
          {this.state.tapped.map((row, rowIndex) => {
            // Return row of pads + tools
            return <div className = 'row' id={rowIndex}>
              <select value={this.state.names[rowIndex]} onChange={(e) => this.changeInstrument(e.target.parentNode.id, e.target.value)}>
                <option value='kick'>kick</option>
                <option value='snare'>snare</option>
                <option value='hi-hat'>hi-hat</option>
                <option value='open-hat'>o-hat</option>
                <option value='tom1'>tom 1</option>
                <option value='tom2'>tom 2</option>
              </select>

              {/* Return each pad  */}
              {row.map((pad, padIndex) => {
                return this.renderPad(rowIndex, padIndex)
              })}

              <button className='clear' onClick={(e) => {
                this.clearRow(e.target.parentNode.id)
              }}>clear</button>

              <button className='delete' onClick={(e) => {
                this.deleteRow(e.target.parentNode.id)
              }}>X</button>

            </div>
          })}

        </div>
        {/* Add Row */}
        <button id='addrow' onClick={this.addRow}>+ Add Instrument</button>

        <footer>
          <p>Design inspired by <a href='https://n1k0.github.io/tinysynth/'>@n1k0</a></p>
          <p>Copyright 2017</p>
        </footer>
      </div>
    )
  }
}

ReactDOM.render(<DrumMachine />, document.getElementById('app'))