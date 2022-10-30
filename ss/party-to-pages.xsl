<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">
		<xsl:for-each select="/document/public//character">
			<div class="menupage characterpage" style="display: none;">
				<xsl:attribute name="data-menupage"><xsl:value-of
					select="@name" /></xsl:attribute>

				<div class="namerace">
					<h2>
						<xsl:value-of select="@name" />
					</h2>

					<xsl:for-each select="types/type">
						<xsl:text> </xsl:text>
						<xsl:value-of select="@name" />
					</xsl:for-each>
					<xsl:for-each select="subtypes/subtype">
						<xsl:text> (</xsl:text>
						<xsl:value-of select="@name" />
						<xsl:text>)</xsl:text>
					</xsl:for-each>
				</div>

				<div class="health">
					<span class="hp">

						<strong>
							HP:
							<xsl:value-of select="health/@hitpoints" />
						</strong>
						<span>
							(
							<xsl:value-of select="health/@hitdice" />
							)
						</span>
					</span>
				</div>


				<xsl:for-each select="classes/class">
					<div class="classsummary">
						<xsl:text> </xsl:text>
						<xsl:value-of select="@name" />
						<xsl:text> </xsl:text>
						<xsl:value-of select="@level" />
						<xsl:text> </xsl:text>
						<xsl:if test="@casterlevel and @casterlevel > 0">
							<div class="castersummary">
								<xsl:text> </xsl:text>
								<xsl:value-of select="@spells" />
								<xsl:text> </xsl:text>
								<xsl:value-of select="@castersource" />
								<xsl:text> Lvl </xsl:text>
								<xsl:value-of select="@casterlevel" />
								<xsl:text>, DC </xsl:text>
								<xsl:value-of select="@basespelldc" />
								<xsl:text>, Conc </xsl:text>
								<xsl:value-of select="@concentrationcheck" />
								<xsl:text>, </xsl:text>
								<xsl:value-of select="@overcomespellresistance" />
								<xsl:text> vs SR </xsl:text>
							</div>
						</xsl:if>
					</div>
				</xsl:for-each>

				<xsl:if test="senses/special">
					<h3>Senses</h3>
					<xsl:for-each select="senses/special">
						<div>
							<div class="has-description">
								<xsl:value-of select="@name" />
							</div>
							<xsl:call-template name="has-description" />
						</div>
					</xsl:for-each>
				</xsl:if>


				<h3>Stats</h3>

				<table class="stats">
					<xsl:for-each select="attributes/attribute">
						<tr>
							<td>
								<xsl:value-of select="@name" />
							</td>
							<td>
								<xsl:value-of select="attrvalue/@text" />
							</td>
							<td>
								(
								<xsl:value-of select="attrbonus/@text" />
								)
							</td>
						</tr>
						<tr>
							<td colspan="3">
								<xsl:call-template
									name="do-situational-modifiers" />
							</td>
						</tr>
					</xsl:for-each>

				</table>

				<h3>Saves</h3>

				<table class="saves">
					<tr>
						<th></th>
						<th></th>
						<th></th>
						<th>base</th>
						<th>attr</th>
						<th>resist</th>
						<th>misc</th>
					</tr>
					<xsl:for-each select="saves/save">
						<tr>
							<td>
								<xsl:value-of select="@abbr" />
							</td>
							<td>
								<xsl:value-of select="@save" />
							</td>
							<td>
								<xsl:text>=</xsl:text>
							</td>
							<td>
								<xsl:value-of select="@base" />
							</td>
							<td>
								<xsl:value-of select="@fromattr" />
							</td>
							<td>
								<xsl:value-of select="@fromresist" />
							</td>
							<td>
								<xsl:value-of select="@frommisc" />
							</td>
						</tr>
						<tr>
							<td colspan="7">
								<xsl:call-template
									name="do-situational-modifiers" />
							</td>
						</tr>
					</xsl:for-each>

				</table>




				<div class="legal">
					<xsl:copy-of
						select="/document/public/program/programinfo/text()" />
				</div>
			</div>
		</xsl:for-each>
	</xsl:template>

	<xsl:template name="do-situational-modifiers">
		<xsl:for-each select="situationalmodifiers">
			<xsl:choose>
				<xsl:when test="situationalmodifier">
					<xsl:for-each select="situationalmodifier">
						<div class="situational-modifier">
							<strong>
								<xsl:value-of select="@source" />
								<xsl:text>: </xsl:text>
							</strong>
							<xsl:value-of select="@text" />
						</div>
					</xsl:for-each>
				</xsl:when>
				<xsl:otherwise>
					<div class="situational-modifier">
						<xsl:value-of select="@text" />
					</div>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
	</xsl:template>

	<xsl:template name="has-description">
		<xsl:for-each select="description">
			<p class="description">
				<xsl:copy-of select="text()"></xsl:copy-of>
			</p>
		</xsl:for-each>
	</xsl:template>


</xsl:stylesheet> 