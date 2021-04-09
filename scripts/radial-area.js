function RadialAreaChart() {
	this._data = null;
	this._sel = null;
	this._size = 180;
	this._outerRadius = () => {
		return this._size / 2;
	};
	this._innerRadius = 150;

	this.data = function () {
		if (arguments.length > 0) {
			this._data = arguments[0];
			return this;
		}
		return this._data;
	};

	this.selection = function () {
		if (arguments.length > 0) {
			this._sel = arguments[0];
			return this;
		}
		return this._sel;
	};

	this.size = function () {
		if (arguments.length > 0) {
			this._size = arguments[0];
			this._outerRadius = this._size / 2;
			return this;
		}
		return this._size;
	};

	this.draw = function () {
		let scaleX = d3
			.scaleBand()
			.domain(this._data.map((d) => d.name))
			.range([0, 2 * Math.PI]);

		let scaleY = d3
			.scaleRadial()
			.domain([0, d3.max(this._data, (d) => d.total)])
			.range([this._innerRadius, this._outerRadius]);

		console.log(this._data);

		const radialGradient = svg
			.append("defs")
			.append("radialGradient")
			.attr("id", "radial-gradient")
			.selectAll("stop")
			.data([
				{ offset: "0%", color: "#feffb3" },
				{ offset: "80%", color: "#8ed3c7" },
				{ offset: "100%", color: "#59b1a2" },
			])
			.enter()
			.append("stop")
			.attr("offset", (d) => d.offset)
			.attr("stop-color", (d) => d.color);

		let area = d3
			.areaRadial()
			.curve(d3.curveLinearClosed)
			.angle((d) => scaleX(d.name))
			.innerRadius(this._innerRadius)
			.outerRadius((d) => scaleY(d.total));

		let areaG = this._sel
			.append("g")
			.attr("transform", `translate(${size.w / 2}, ${size.h / 2})`);

		areaG
			.append("path")
			.datum(this._data)
			.attr("fill", "url(#radial-gradient")
			.attr("fill-opacity", 0.7)
			.attr("d", area)
			.attr("transform", `rotate(${-360 / 40})`);

		this._drawAxisX(scaleX);
		this._drawAxisY(scaleY);
	};

	this._drawAxisX = function (scaleX) {
		let axisXG = this._sel
			.selectAll("g.axis-x")
			.data([0])
			.join("g")
			.classed("axis-x", true)
			.attr("transform", `translate(${size.w / 2}, ${size.h / 2})`);

		axisXG
			.selectAll("g")
			.data(this._data)
			.join("g")
			.attr(
				"transform",
				(d) => `
              rotate(${
					((scaleX(d.name) + scaleX.bandwidth() / 2) * 180) /
						Math.PI -
					180
				})
              translate(${this._innerRadius - 10}, 0)
          `
			)
			.call((g) => {
				// append ticks
				g.selectAll("line")
					.data([0])
					.join("line")
					.attr("x1", 8)
					.attr("x2", 220)
					.attr("stroke", "#9e9e9e61");
			})
			.call((g) => {
				// append text
				g.selectAll("text")
					.data((d) => [d.name])
					.join("text")
					.classed("axis-x-text", true)
					.attr("text-anchor", "middle")
					.attr("transform", (d) => {
						let angle =
							(scaleX(d) + scaleX.bandwidth() / 2 + Math.PI) %
							(2 * Math.PI);
						let rotate = 90;
						if (angle < Math.PI) {
							rotate = -90;
						}
						return `rotate(${rotate}) translate(0, 3)`;
					})
					.text((d) => d);
			});
	};

	this._drawAxisY = function (scaleY) {
		let axisYG = this._sel
			.selectAll("g.axis-y")
			.data([0])
			.join("g")
			.classed("axis-y", true)
			.attr("transform", `translate(${size.w / 2}, ${size.h / 2})`);

		axisYG.call((g) => {
			g.selectAll("g")
				.data(scaleY.ticks(5))
				.join("g")
				.call((g) => {
					g.append("circle")
						.attr("r", (d) => scaleY(d))
						.attr("fill", "none")
						.attr("stroke", "#9e9e9e61");
				})
				.call((g) => {
					g.append("text")
						.attr("y", (d) => -scaleY(d) - 5)
						.attr("text-anchor", "middle")
						.attr("fill", "#464646")
						.text((d) => d);
				});
		});
	};

	return this;
}
